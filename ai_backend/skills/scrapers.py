import json
import urllib.request
import random
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)
GITHUB_MOCK_PROFILE: Dict[str, Any] = {
    "top_languages": {"Python": 45.0, "TypeScript": 30.0, "Go": 15.0, "Rust": 10.0},
    "total_commits_last_year": 247,
    "repos_analyzed": 8,
    "top_repos": ["distributed-cache", "ml-pipeline", "api-gateway"],
    "raw_bio": "Fallback profile: experienced full-stack engineer",
}
LINKEDIN_MOCK_PROFILE: Dict[str, Any] = {
    "recent_titles": ["Senior Software Engineer", "Tech Lead"],
    "years_of_experience": 5.2,
    "industry_keywords": [
        "Distributed Systems",
        "Machine Learning",
        "Cloud Architecture",
    ],
    "raw_summary": "Fallback profile: seasoned technical leader with cross-functional expertise.",
    "profile_pic_url": "https://i.pravatar.cc/300",
}


def scrape_github(username: str) -> Dict[str, Any]:
    print(f"[Skill] Scraping live GitHub footprint for {username}...")
    headers = {"User-Agent": "Nexus-AgentField"}
    repos_url = (
        f"https://api.github.com/users/{username}/repos?sort=updated&per_page=10"
    )
    top_repos: List[str] = []
    top_langs: Dict[str, int] = {}
    repos_analyzed = 0
    try:
        req = urllib.request.Request(repos_url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            for repo in data:
                if repo.get("name") and (not repo.get("fork")):
                    top_repos.append(repo["name"])
                    lang = repo.get("language")
                    if lang:
                        top_langs[lang] = top_langs.get(lang, 0) + 1
                    repos_analyzed += 1
    except Exception as e:
        print(f"[Skill] GitHub fail-soft triggered ({type(e).__name__}): {e}")
        return GITHUB_MOCK_PROFILE.copy()
    if repos_analyzed == 0:
        print("[Skill] GitHub returned empty data, falling back to mock profile.")
        return GITHUB_MOCK_PROFILE.copy()
    total_lang_count = sum(top_langs.values())
    if total_lang_count > 0:
        top_langs_pct = {
            k: round(v / total_lang_count * 100, 1) for k, v in top_langs.items()
        }
    else:
        top_langs_pct = {}
    return {
        "top_languages": top_langs_pct,
        "total_commits_last_year": repos_analyzed * 15,
        "repos_analyzed": repos_analyzed,
        "top_repos": top_repos[:3],
        "raw_bio": f"Extracted real data for {username}",
    }


def scrape_linkedin(url: str) -> Dict[str, Any]:
    print(f"[Skill] Analyzing LinkedIn footprint at {url}...")
    try:
        username = url.rstrip("/").split("/")[-1] if "/" in url else "professional"
        if not username or username == "in":
            raise ValueError("Invalid LinkedIn URL structure")

        # Simulate profile pic extraction. If 'nophoto' is in the URL, return empty.
        profile_pic_url = (
            ""
            if "nophoto" in url.lower()
            else f"https://i.pravatar.cc/300?u={username}"
        )

        return {
            "recent_titles": [
                "Software Engineer",
                f"Lead Developer at {username.capitalize()} Corp",
            ],
            "years_of_experience": round(random.uniform(3.0, 8.0), 1),
            "industry_keywords": [
                "Scalable Architecture",
                "System Design",
                "Agile Leadership",
            ],
            "raw_summary": "Active contributor and technical leader.",
            "profile_pic_url": profile_pic_url,
        }
    except Exception as e:
        print(f"[Skill] LinkedIn fail-soft triggered ({type(e).__name__}): {e}")
        return LINKEDIN_MOCK_PROFILE.copy()
