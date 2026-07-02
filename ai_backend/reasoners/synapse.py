import os
import json
from supabase import create_client
from ai_backend.core import agent, emit_thought
from ai_backend.schemas import SynapseSanitizedProfile

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
db = create_client(SUPABASE_URL, SUPABASE_KEY)


@agent.reasoner(name="synapse")
async def execute_synapse(
    user_id: str, github_raw: dict, linkedin_raw: dict, resume_text: str = None
) -> SynapseSanitizedProfile:
    emit_thought(
        "SYNAPSE", user_id, "Ingesting raw GitHub, LinkedIn, and Resume data..."
    )
    system_prompt = "You are SYNAPSE, an expert technical recruiter AI. Analyze the provided raw GitHub metrics, LinkedIn history, and Resume text. Extract a unified list of sanitized_skills (e.g. ['Python', 'React', 'Docker']), write a compelling 2-sentence experience_summary summarizing their expertise, and map the raw metrics directly into the structured format required."
    user_prompt = f"GitHub Data:\n{json.dumps(github_raw)}\n\nLinkedIn Data:\n{json.dumps(linkedin_raw)}\n\nResume Text:\n{resume_text or 'Not provided'}"
    emit_thought(
        "SYNAPSE", user_id, "Running cognitive profile sanitization protocol..."
    )
    sanitized_profile = await agent.ai(
        system=system_prompt, user=user_prompt, schema=SynapseSanitizedProfile
    )
    emit_thought(
        "SYNAPSE",
        user_id,
        f"Identified {len(sanitized_profile.sanitized_skills)} unique skills. Writing to persistent store.",
    )
    try:
        db.table("profiles").upsert(
            {
                "user_id": user_id,
                "sanitized_skills": sanitized_profile.sanitized_skills,
                "experience_summary": sanitized_profile.experience_summary,
                "github_metrics": sanitized_profile.github_metrics.model_dump(),
                "linkedin_history": sanitized_profile.linkedin_history.model_dump(),
            }
        ).execute()
        emit_thought("SYNAPSE", user_id, "Profile stored successfully in Supabase.")
    except Exception as e:
        emit_thought("SYNAPSE", user_id, f"Warning: Failed to store profile — {e}")
    return sanitized_profile
