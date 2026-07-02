import asyncio
import logging
from uuid import UUID
from ai_backend.skills.github_scraper import fetch_github_profile, fetch_github_repos
from ai_backend.skills.linkedin_scraper import fetch_linkedin_profile
from ai_backend.reasoners.synapse import (
    analyze_user_profile,
    generate_targeted_interview,
)
from ai_backend.reasoners.cortex import perform_deep_match
from ai_backend.skills.supabase_queries import (
    save_profile,
    get_active_projects,
    save_match_result,
    save_interview,
)

logger = logging.getLogger(__name__)


async def process_user_registration(linkedin_url: str, github_handle: str):
    logger.info(f"Orchestrating registration for {github_handle}")
    github_profile_task = fetch_github_profile(github_handle)
    github_repos_task = fetch_github_repos(github_handle)
    linkedin_task = fetch_linkedin_profile(linkedin_url)
    gh_prof, gh_repos, li_prof = await asyncio.gather(
        github_profile_task, github_repos_task, linkedin_task
    )
    gh_data = {"profile": gh_prof, "repos": gh_repos}
    user_profile = await analyze_user_profile(
        github_handle, linkedin_url, gh_data, li_prof
    )
    profile_record = await asyncio.to_thread(
        save_profile, user_profile.model_dump(exclude_unset=True)
    )
    if not profile_record:
        logger.error("Failed to save profile to DB")
        return
    user_id = UUID(profile_record["id"])
    active_projects = await asyncio.to_thread(get_active_projects)
    if not active_projects:
        logger.warning("No active projects found for matchmaking.")
        return
    match_result = await perform_deep_match(user_id, user_profile, active_projects)
    matched_project = next(
        (p for p in active_projects if p["id"] == str(match_result.project_id)), None
    )
    project_stack = matched_project["required_tech_stack"] if matched_project else []
    interview_qs = await generate_targeted_interview(user_profile, project_stack)
    await asyncio.to_thread(
        save_match_result,
        {
            "user_id": str(user_id),
            "project_id": str(match_result.project_id),
            "confidence_score": match_result.confidence_score,
            "cortex_justification": match_result.cortex_justification,
        },
    )
    await asyncio.to_thread(
        save_interview,
        {
            "user_id": str(user_id),
            "project_id": str(match_result.project_id),
            "questions": interview_qs,
            "answers": {},
        },
    )
    logger.info(f"Registration and matchmaking complete for {github_handle}")
