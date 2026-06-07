from typing import Annotated, TypedDict

from langgraph.graph.message import add_messages


class ExtractedBrief(TypedDict, total=False):
    product: str
    audience: str
    tone: str
    key_messages: list[str]
    constraints: list[str]


class ReviewFeedback(TypedDict, total=False):
    approved: bool
    score: int
    suggestions: list[str]
    revised_copy: str


class CampaignGraphState(TypedDict):
    """Shared state passed between orchestrator sub-agents."""

    campaign_id: str
    brief: str
    brand_voice: str
    target_audience: str

    extracted: ExtractedBrief
    copy_draft: str
    image_prompt: str
    image_url: str
    review: ReviewFeedback

    messages: Annotated[list, add_messages]
    errors: list[str]
