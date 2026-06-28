import os
import json
import asyncio
from uuid import uuid4
from typing import Optional
from dotenv import load_dotenv
load_dotenv()
from fastapi import BackgroundTasks, HTTPException, status, UploadFile, File
import pypdf
import io
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ai_backend.schemas import RegistrationRequest, RegistrationResponse, InterviewAnswers, ValidationEvaluation
from ai_backend.skills.scrapers import scrape_github, scrape_linkedin
from ai_backend.core import agent, _get_neon_conn as get_neon_conn
from ai_backend.reasoners.synapse import execute_synapse
from ai_backend.reasoners.cortex import execute_cortex
from ai_backend.reasoners.validator import generate_questions, evaluate_answers
app = agent
app.title = 'Nexus API Gateway'
app.description = 'Async router for AgentField framework'
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=False, allow_methods=['*'], allow_headers=['*'])
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')

def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def _emit_gateway_thought(user_id: str, step_status: str) -> None:
    try:
        conn = get_neon_conn()
        cur = conn.cursor()
        cur.execute('INSERT INTO thought_logs (user_id, step, agent, status) VALUES (%s, %s, %s, %s)', (user_id, 'gateway', 'GATEWAY', step_status))
        conn.commit()
        cur.close()
        conn.close()
    except Exception:
        pass

async def process_registration_background(user_id: str, request: RegistrationRequest):
    try:
        _emit_gateway_thought(user_id, 'Scraping GitHub footprint...')
        github_raw = scrape_github(request.github_username)
        _emit_gateway_thought(user_id, 'Scraping LinkedIn footprint...')
        linkedin_raw = scrape_linkedin(str(request.linkedin_url))
        _emit_gateway_thought(user_id, 'Handing off to SYNAPSE for profile sanitization...')
        sanitized_profile = await execute_synapse(user_id=user_id, github_raw=github_raw, linkedin_raw=linkedin_raw, resume_text=request.resume_text)
        _emit_gateway_thought(user_id, 'Handing off to CORTEX for matchmaking...')
        evaluation = await execute_cortex(user_id=user_id, profile=sanitized_profile)
        _emit_gateway_thought(user_id, f'Pipeline complete. Match confidence: {evaluation.match_confidence_score * 100:.0f}%')
        conn = get_neon_conn()
        cur = conn.cursor()
        cur.execute('INSERT INTO thought_logs (user_id, step, agent, status) VALUES (%s, %s, %s, %s)', (user_id, 'complete', 'GATEWAY', 'All agents finished processing.'))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        _emit_gateway_thought(user_id, f'Pipeline error: {e}')
        print(f'[Gateway] Background process failed: {e}')

@app.post('/api/register', response_model=RegistrationResponse, status_code=status.HTTP_202_ACCEPTED)
async def register_user(request: RegistrationRequest, background_tasks: BackgroundTasks):
    user_id = str(uuid4())
    try:
        db = get_supabase()
        db.table('users').insert({'id': user_id, 'github_username': request.github_username, 'linkedin_url': str(request.linkedin_url)}).execute()
    except Exception as e:
        print(f'Warning: Failed to insert user: {e}')
    background_tasks.add_task(process_registration_background, user_id, request)
    return RegistrationResponse(user_id=user_id, status='processing', message='Footprint received. Initiating cognitive analysis.')

@app.post('/api/parse_resume')
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf') and not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")
    
    content = await file.read()
    if file.filename.endswith('.txt'):
        return {"resume_text": content.decode('utf-8', errors='ignore')}
    
    try:
        reader = pypdf.PdfReader(io.BytesIO(content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return {"resume_text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {e}")

@app.get('/api/stream/{user_id}')
async def stream_thought_log(user_id: str):

    async def event_generator():
        seen = 0
        max_wait = 120
        elapsed = 0
        while elapsed < max_wait:
            try:
                conn = get_neon_conn()
                cur = conn.cursor()
                cur.execute('SELECT step, agent, status FROM thought_logs WHERE user_id = %s ORDER BY id ASC', (user_id,))
                rows = cur.fetchall()
                cur.close()
                conn.close()
                for row in rows[seen:]:
                    event = {'step': row[0], 'agent': row[1], 'status': row[2]}
                    yield f'data: {json.dumps(event)}\n\n'
                    seen = len(rows)
                    if row[0] == 'complete':
                        return
            except Exception:
                pass
            await asyncio.sleep(0.8)
            elapsed += 0.8
        yield f'data: {json.dumps({"step": "complete", "agent": "GATEWAY", "status": "Stream timeout."})}\n\n'
    return StreamingResponse(event_generator(), media_type='text/event-stream')

@app.get('/health')
def health_check():
    return {'status': 'ACTIVE_HEALTHY'}

@app.get('/api/user/{user_id}/status')
def check_user_status(user_id: str):
    db = get_supabase()
    match = db.table('matches').select('id, status').eq('user_id', user_id).limit(1).execute()
    if match.data:
        return {'status': match.data[0]['status'], 'match_id': match.data[0]['id']}
    user = db.table('users').select('id').eq('id', user_id).limit(1).execute()
    if user.data:
        return {'status': 'processing'}
    return {'status': 'not_found'}

class ScanRequest(BaseModel):
    user_id: Optional[str] = None

@app.post('/api/scan', status_code=status.HTTP_202_ACCEPTED)
async def trigger_scan(req: ScanRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid4())
    user_id = req.user_id or 'system'
    try:
        conn = get_neon_conn()
        cur = conn.cursor()
        cur.execute('INSERT INTO scan_jobs (id, user_id, progress, status) VALUES (%s, %s, %s, %s)', (job_id, user_id, 0, 'running'))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to create scan job: {e}')
    background_tasks.add_task(_run_scan_job, job_id, user_id)
    return {'job_id': job_id, 'status': 'running'}

async def _run_scan_job(job_id: str, user_id: str):
    stages = [(20, 'Fetching active project vacancies...'), (40, 'Scanning unmatched developer pool...'), (60, 'Running skill-gap intersection analysis...'), (80, 'Ranking candidates by confidence score...'), (100, 'Scan complete.')]
    for progress, msg in stages:
        await asyncio.sleep(1.5)
        try:
            conn = get_neon_conn()
            cur = conn.cursor()
            status_val = 'complete' if progress == 100 else 'running'
            cur.execute('UPDATE scan_jobs SET progress = %s, status = %s, updated_at = NOW() WHERE id = %s', (progress, status_val, job_id))
            conn.commit()
            cur.close()
            conn.close()
        except Exception:
            pass

@app.get('/api/scan/{job_id}')
def get_scan_status(job_id: str):
    try:
        conn = get_neon_conn()
        cur = conn.cursor()
        cur.execute('SELECT progress, status, result FROM scan_jobs WHERE id = %s', (job_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return {'job_id': job_id, 'progress': row[0], 'status': row[1], 'result': row[2]}
        raise HTTPException(status_code=404, detail='Job not found')
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/interview/{match_id}/generate')
async def generate_interview(match_id: str):
    db = get_supabase()
    match_data = db.table('matches').select('user_id').eq('id', match_id).execute()
    if not match_data.data:
        raise HTTPException(status_code=404, detail='Match not found')
    user_id = match_data.data[0]['user_id']
    profile_data = db.table('profiles').select('sanitized_skills, github_metrics').eq('user_id', user_id).execute()
    if profile_data.data:
        skills = profile_data.data[0]['sanitized_skills']
        github_metrics = profile_data.data[0]['github_metrics'] or {}
        top_repos = github_metrics.get('top_repos', []) if isinstance(github_metrics, dict) else []
    else:
        skills = []
        top_repos = []
    questions = await generate_questions(match_id=match_id, profile_skills=skills, top_repos=top_repos)
    return questions

@app.post('/api/interview/{match_id}/submit', response_model=ValidationEvaluation)
async def submit_interview(match_id: str, answers: InterviewAnswers):
    db = get_supabase()
    val_data = db.table('validations').select('id, questions').eq('match_id', match_id).execute()
    if not val_data.data:
        raise HTTPException(status_code=404, detail='Validation record not found')
    validation_id = val_data.data[0]['id']
    questions = val_data.data[0]['questions']
    evaluation = await evaluate_answers(match_id=match_id, validation_id=validation_id, questions=questions, answers=answers.answers)
    if evaluation.validation_score >= 0.7:
        db.table('matches').update({'status': 'mutual_accepted'}).eq('id', match_id).execute()
        evaluation.workspace_links = {'github': f'https://github.com/Nexus-Network/Project-{match_id[:8]}', 'discord': 'https://discord.gg/nexus-token'}
    else:
        db.table('matches').update({'status': 'rejected'}).eq('id', match_id).execute()
    return evaluation

class CandidateStatusUpdate(BaseModel):
    status: str

@app.get('/api/candidates')
def get_candidates():
    db = get_supabase()
    try:
        users = db.table('users').select('*').execute().data
        matches = db.table('matches').select('*').execute().data
        profiles = db.table('profiles').select('*').execute().data
        
        candidates = []
        for u in users:
            uid = u['id']
            user_match = next((m for m in matches if m.get('user_id') == uid), None)
            user_profile = next((p for p in profiles if p.get('user_id') == uid), None)
            
            score = user_match.get('match_confidence_score', 0) if user_match else 0
            status = user_match.get('status', 'processing') if user_match else 'processing'
            skills = user_profile.get('sanitized_skills', []) if user_profile else []
            
            candidates.append({
                'user_id': uid,
                'github_username': u.get('github_username', ''),
                'linkedin_url': u.get('linkedin_url', ''),
                'skills': skills,
                'confidence_score': score,
                'status': status,
                'created_at': user_match.get('created_at', u.get('created_at', '')) if user_match else u.get('created_at', '')
            })
        return candidates
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/candidates/{user_id}/qa')
def get_candidate_qa(user_id: str):
    db = get_supabase()
    match = db.table('matches').select('id').eq('user_id', user_id).execute().data
    if not match:
        return {'questions': [], 'answers': []}
    match_id = match[0]['id']
    validation = db.table('validations').select('questions, answers').eq('match_id', match_id).execute().data
    if not validation:
        return {'questions': [], 'answers': []}
    
    questions = validation[0].get('questions') or []
    answers = validation[0].get('answers') or []
    return {'questions': questions, 'answers': answers}

@app.patch('/api/candidates/{user_id}/status')
def update_candidate_status(user_id: str, payload: CandidateStatusUpdate):
    db = get_supabase()
    try:
        match = db.table('matches').select('id').eq('user_id', user_id).execute().data
        if match:
            match_id = match[0]['id']
            db.table('matches').update({'status': payload.status}).eq('id', match_id).execute()
            return {'status': 'success'}
        raise HTTPException(status_code=404, detail='Match not found')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))