import httpx
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


async def fetch_github_profile(handle: str) -> Dict[str, Any]:
    logger.info(f"Fetching GitHub profile for {handle}")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"https://api.github.com/users/{handle}")
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"GitHub API Error for {handle}: {e}")
            return {}


async def fetch_github_repos(handle: str) -> List[Dict[str, Any]]:
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"https://api.github.com/users/{handle}/repos?sort=updated&per_page=10"
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"GitHub API Error for repos of {handle}: {e}")
            return []
