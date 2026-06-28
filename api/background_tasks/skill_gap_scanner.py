import asyncio
import logging
from ai_backend.skills.supabase_queries import get_active_projects, get_floating_developers, save_match_result
from ai_backend.schemas import UserProfile
from ai_backend.reasoners.cortex import perform_deep_match
from uuid import UUID
logger = logging.getLogger(__name__)

async def scan_skill_gaps():
    await asyncio.sleep(5)
    while True:
        try:
            logger.info('Running background skill-gap scan...')
            projects = await asyncio.to_thread(get_active_projects)
            devs = await asyncio.to_thread(get_floating_developers)
            gapped_projects = [p for p in projects if p.get('flagged_skill_gaps')]
            if gapped_projects and devs:
                for dev in devs:
                    profile = UserProfile(github_handle=dev['github_handle'], linkedin_url=dev.get('linkedin_url'), synthesized_bio=dev.get('synthesized_bio'), primary_language=dev.get('primary_language'), verified_skills=dev.get('verified_skills', []))
                    match = await perform_deep_match(UUID(dev['id']), profile, gapped_projects)
                    if match and match.confidence_score > 0.85:
                        logger.info(f'Skill Gap Match Found! Dev {dev['github_handle']} mapped to project {match.project_id}')
                        await asyncio.to_thread(save_match_result, {'user_id': dev['id'], 'project_id': str(match.project_id), 'confidence_score': match.confidence_score, 'cortex_justification': match.cortex_justification})
        except Exception as e:
            logger.error(f'Skill gap scanner error: {e}')
        await asyncio.sleep(60)