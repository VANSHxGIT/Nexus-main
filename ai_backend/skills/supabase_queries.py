import os
import logging
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import List, Dict, Any
load_dotenv()
logger = logging.getLogger(__name__)
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_active_projects() -> List[Dict[str, Any]]:
    try:
        response = supabase.table('projects').select('*').eq('is_active', True).execute()
        return response.data
    except Exception as e:
        logger.error(f'Error fetching active projects: {e}')
        return []

def save_profile(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        response = supabase.table('profiles').upsert(profile_data, on_conflict='github_handle').execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        logger.error(f'Error saving profile: {e}')
        return {}

def save_match_result(match_data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        response = supabase.table('matches').insert(match_data).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        logger.error(f'Error saving match result: {e}')
        return {}

def save_interview(interview_data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        response = supabase.table('interviews').insert(interview_data).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        logger.error(f'Error saving interview result: {e}')
        return {}

def get_user_profile_and_matches(github_handle: str) -> Dict[str, Any]:
    try:
        profile_resp = supabase.table('profiles').select('*').eq('github_handle', github_handle).execute()
        if not profile_resp.data:
            return {'error': 'Profile not found or still processing'}
        profile = profile_resp.data[0]
        user_id = profile['id']
        matches_resp = supabase.table('matches').select('*, projects(*)').eq('user_id', user_id).execute()
        interviews_resp = supabase.table('interviews').select('*').eq('user_id', user_id).execute()
        return {'profile': profile, 'matches': matches_resp.data, 'interviews': interviews_resp.data}
    except Exception as e:
        logger.error(f'Error fetching profile and matches: {e}')
        return {'error': str(e)}

def get_floating_developers() -> List[Dict[str, Any]]:
    try:
        resp = supabase.table('profiles').select('*').execute()
        return resp.data
    except Exception as e:
        logger.error(f'Error fetching floating devs: {e}')
        return []