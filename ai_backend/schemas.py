from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional
from uuid import UUID


class RegistrationRequest(BaseModel):
    github_username: str = Field(..., description="The GitHub username of the user.")
    linkedin_url: HttpUrl = Field(
        ..., description="The LinkedIn profile URL of the user."
    )
    resume_text: Optional[str] = None


class RegistrationResponse(BaseModel):
    user_id: UUID
    status: str
    message: str


class GithubMetrics(BaseModel):
    top_languages: dict[str, float] = Field(
        default_factory=dict, description="Language usage percentages"
    )
    total_commits_last_year: int = Field(default=0)
    repos_analyzed: int = Field(default=0)
    top_repos: List[str] = Field(
        default_factory=list, description="Top repositories by stars or recent activity"
    )


class LinkedinHistory(BaseModel):
    recent_titles: List[str] = Field(default_factory=list)
    years_of_experience: float = Field(default=0.0)
    industry_keywords: List[str] = Field(default_factory=list)


class SynapseSanitizedProfile(BaseModel):
    sanitized_skills: List[str] = Field(
        ..., description="Cleaned, unified list of technical skills"
    )
    experience_summary: str = Field(
        ..., description="A professional, non-fluffed summary of experience"
    )
    github_metrics: GithubMetrics
    linkedin_history: LinkedinHistory


class CortexMatchEvaluation(BaseModel):
    match_confidence_score: float = Field(
        ..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0"
    )
    justification: str = Field(
        ..., description="Two-sentence textual justification for the score"
    )


class InterviewQuestions(BaseModel):
    questions: List[str] = Field(
        ...,
        min_length=3,
        description="Exactly 3 tailored technical questions, plus any custom HR questions",
    )


class InterviewAnswers(BaseModel):
    answers: List[str] = Field(
        ..., min_length=3, description="Answers corresponding to the questions"
    )


class ValidationEvaluation(BaseModel):
    validation_score: float = Field(
        ..., ge=0.0, le=1.0, description="Evaluation score of the answers"
    )
    workspace_links: Optional[dict] = Field(
        default=None, description="Provisioned workspace links upon success"
    )


class TransactionTracePayload(BaseModel):
    event_type: str
    agent_node: str
    input_snapshot: dict
    output_snapshot: dict
    timestamp: str
