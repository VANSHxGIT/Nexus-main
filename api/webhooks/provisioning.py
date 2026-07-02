from fastapi import APIRouter
import logging
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)


class MatchAcceptance(BaseModel):
    user_id: str
    project_id: str


@router.post("/api/webhooks/provision")
async def provision_channel(acceptance: MatchAcceptance):
    logger.info(
        f"Received mutual match acceptance for user {acceptance.user_id} and project {acceptance.project_id}"
    )
    channel_name = f"nexus-{acceptance.project_id[:8]}-{acceptance.user_id[:8]}"
    brief = f"Welcome! We created #{channel_name} for you. \n\nGetting Started Brief: Dive into the codebase, review the open issues, and sync with the team on the flagged skill gaps."
    logger.info(f"[PROVISIONING] Created channel {channel_name}. Dispatched brief.")
    return {"status": "success", "channel": channel_name, "brief": brief}
