import json
import sys
import os
import asyncio
from typing import Dict, Any, List
from dotenv import load_dotenv
load_dotenv()
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from ai_backend.skills.scrapers import scrape_github, scrape_linkedin
from ai_backend.reasoners.synapse import execute_synapse
from ai_backend.reasoners.cortex import execute_cortex
from ai_backend.schemas import SynapseSanitizedProfile, CortexMatchEvaluation
from uuid import uuid4
TEST_PROFILES: List[Dict[str, Any]] = [{'name': 'Full-Stack Polyglot', 'github_username': 'EobardThawne2', 'linkedin_url': 'https://linkedin.com/in/sumeer-khattar', 'expected_skills_subset': ['Python'], 'description': 'Real GitHub profile with diverse language footprint.'}, {'name': 'Frontend Specialist', 'github_username': 'nonexistent-user-404-xyz', 'linkedin_url': 'https://linkedin.com/in/jane-doe-frontend', 'expected_skills_subset': ['TypeScript'], 'description': 'Triggers fail-soft mock fallback for GitHub scraping.'}, {'name': 'ML/AI Researcher', 'github_username': 'torvalds', 'linkedin_url': 'https://linkedin.com/in/ml-researcher-phd', 'expected_skills_subset': ['C'], 'description': 'High-profile account. Validates language extraction at scale.'}, {'name': 'DevOps Engineer', 'github_username': 'kelseyhightower', 'linkedin_url': 'https://linkedin.com/in/devops-lead', 'expected_skills_subset': ['Go'], 'description': 'Validates correct language parsing for Go-dominant repos.'}, {'name': 'Empty Profile Edge Case', 'github_username': '', 'linkedin_url': 'https://linkedin.com/in/', 'expected_skills_subset': [], 'description': 'Edge case: empty inputs should trigger fail-soft cleanly.'}]

async def run_eval_profile(profile: Dict[str, Any]) -> Dict[str, Any]:
    results: Dict[str, Any] = {'profile_name': profile['name'], 'checks': {}}
    github_data = scrape_github(profile['github_username'])
    results['checks']['github_scrape_no_crash'] = github_data is not None and isinstance(github_data, dict)
    results['checks']['github_has_required_keys'] = all((k in github_data for k in ['top_languages', 'total_commits_last_year', 'repos_analyzed', 'top_repos']))
    linkedin_data = scrape_linkedin(profile['linkedin_url'])
    results['checks']['linkedin_scrape_no_crash'] = linkedin_data is not None and isinstance(linkedin_data, dict)
    results['checks']['linkedin_has_required_keys'] = all((k in linkedin_data for k in ['recent_titles', 'years_of_experience', 'industry_keywords']))
    user_id = str(uuid4())
    try:
        sanitized = await execute_synapse(user_id=user_id, github_raw=github_data, linkedin_raw=linkedin_data)
        results['checks']['synapse_returns_valid_schema'] = isinstance(sanitized, SynapseSanitizedProfile)
        results['checks']['synapse_has_skills'] = len(sanitized.sanitized_skills) > 0 or len(profile['expected_skills_subset']) == 0
        expected = profile['expected_skills_subset']
        if expected:
            found = any((s in sanitized.sanitized_skills for s in expected))
            results['checks']['identified_primary_skill'] = found
        else:
            results['checks']['identified_primary_skill'] = True
    except Exception as e:
        results['checks']['synapse_returns_valid_schema'] = False
        results['checks']['synapse_has_skills'] = False
        results['checks']['identified_primary_skill'] = False
        results['checks']['synapse_error'] = str(e)
        sanitized = None
    try:
        if sanitized:
            evaluation = await execute_cortex(user_id=user_id, profile=sanitized)
            results['checks']['cortex_returns_valid_schema'] = isinstance(evaluation, CortexMatchEvaluation)
            results['checks']['cortex_score_in_range'] = 0.0 <= evaluation.match_confidence_score <= 1.0
            results['checks']['cortex_has_justification'] = len(evaluation.justification) > 10
        else:
            raise Exception('Skipped due to synapse failure')
    except Exception as e:
        results['checks']['cortex_returns_valid_schema'] = False
        results['checks']['cortex_score_in_range'] = False
        results['checks']['cortex_has_justification'] = False
        results['checks']['cortex_error'] = str(e)
    return results

async def async_main():
    print('=' * 70)
    print('  NEXUS EVALUATION HARNESS')
    print('  Testing orchestrator pipeline against 5 challenging profiles')
    print('=' * 70)
    all_results: List[Dict[str, Any]] = []
    total_checks = 0
    total_passed = 0
    for i, profile in enumerate(TEST_PROFILES):
        print(f'\n[{i + 1}/5] Evaluating: {profile['name']}')
        print(f'       {profile['description']}')
        result = await run_eval_profile(profile)
        all_results.append(result)
        checks = result['checks']
        passed = sum((1 for v in checks.values() if v is True))
        failed = sum((1 for v in checks.values() if v is False))
        total_checks += passed + failed
        total_passed += passed
        for check_name, check_val in checks.items():
            if isinstance(check_val, bool):
                status_icon = 'PASS' if check_val else 'FAIL'
                color = '\x1b[92m' if check_val else '\x1b[91m'
                print(f'       {color}[{status_icon}]\x1b[0m {check_name}')
            else:
                print(f'       [INFO] {check_name}: {check_val}')
    print('\n' + '=' * 70)
    print(f'  FINAL SCORE: {total_passed}/{total_checks} checks passed')
    pass_rate = total_passed / total_checks * 100 if total_checks > 0 else 0
    print(f'  PASS RATE:   {pass_rate:.1f}%')
    verdict = 'PASS' if pass_rate >= 80.0 else 'FAIL'
    color = '\x1b[92m' if verdict == 'PASS' else '\x1b[91m'
    print(f'  VERDICT:     {color}{verdict}\x1b[0m')
    print('=' * 70)
    return 0 if verdict == 'PASS' else 1

def main():
    return asyncio.run(async_main())
if __name__ == '__main__':
    sys.exit(main())