import httpx
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


async def fetch_github_profile(github_handle: str) -> Dict[str, Any]:
    logger.info(f"Fetching GitHub data for {github_handle}")
    url = f"https://api.github.com/users/{github_handle}"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch GitHub profile for {github_handle}: {e}")
            return {"error": str(e), "handle": github_handle}


async def fetch_github_repos(github_handle: str) -> List[Dict[str, Any]]:
    url = f"https://api.github.com/users/{github_handle}/repos?sort=updated&per_page=5"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch repos for {github_handle}: {e}")
            return []
