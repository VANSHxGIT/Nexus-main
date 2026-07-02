import os
import json
from supabase import create_client
from ai_backend.core import agent, emit_thought
from ai_backend.schemas import CortexMatchEvaluation, SynapseSanitizedProfile

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
db = create_client(SUPABASE_URL, SUPABASE_KEY)


@agent.reasoner(name="cortex")
async def execute_cortex(
    user_id: str, profile: SynapseSanitizedProfile
) -> CortexMatchEvaluation:
    emit_thought(
        "CORTEX", user_id, "Initiating bi-directional matchmaking analytics..."
    )
    vacs = (
        db.table("project_vacancies").select("id, required_skills").limit(1).execute()
    )
    if vacs.data:
        mock_vacancy_id = vacs.data[0]["id"]
        required_skills = vacs.data[0].get(
            "required_skills", ["Python", "FastAPI", "React"]
        )
        emit_thought(
            "CORTEX",
            user_id,
            f"Found existing vacancy. Required skills: {', '.join(required_skills[:3])}",
        )
    else:
        emit_thought(
            "CORTEX", user_id, "No vacancies found. Bootstrapping project scaffold..."
        )
        proj = (
            db.table("projects")
            .insert({"name": "Agentathon Core", "description": "Core platform"})
            .execute()
        )
        proj_id = proj.data[0]["id"]
        required_skills = ["Python", "FastAPI", "PostgreSQL", "React"]
        vac = (
            db.table("project_vacancies")
            .insert(
                {
                    "project_id": proj_id,
                    "role_title": "Backend AI Engineer",
                    "required_skills": required_skills,
                }
            )
            .execute()
        )
        mock_vacancy_id = vac.data[0]["id"]
    emit_thought("CORTEX", user_id, "Synthesizing match confidence evaluation...")
    system_prompt = "You are CORTEX, an AI matchmaking engine. Evaluate the candidate's sanitized profile against the required skills. Output a fair match_confidence_score between 0.0 and 1.0, and a concise 2-sentence justification explaining why."
    user_prompt = f"Candidate Profile:\n{profile.model_dump_json()}\n\nRequired Skills:\n{json.dumps(required_skills)}"
    evaluation = await agent.ai(
        system=system_prompt, user=user_prompt, schema=CortexMatchEvaluation
    )
    emit_thought(
        "CORTEX",
        user_id,
        f"Match evaluated. Confidence: {evaluation.match_confidence_score * 100:.0f}%",
    )
    try:
        db.table("matches").insert(
            {
                "user_id": user_id,
                "vacancy_id": mock_vacancy_id,
                "match_confidence_score": evaluation.match_confidence_score,
                "justification": evaluation.justification,
                "status": "pending_validation",
            }
        ).execute()
        emit_thought("CORTEX", user_id, "Match stored in Supabase successfully.")
    except Exception as e:
        emit_thought("CORTEX", user_id, f"Warning: Failed to insert match — {e}")
    return evaluation
