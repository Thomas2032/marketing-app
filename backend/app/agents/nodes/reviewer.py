import json

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.agents.state import CampaignGraphState, ReviewFeedback
from app.config import get_settings


REVIEWER_SYSTEM = """You are a senior marketing reviewer. Evaluate campaign copy and image prompt alignment.
Return valid JSON only with keys: approved (bool), score (0-100), suggestions (array of strings), revised_copy (string)."""


async def reviewer_node(state: CampaignGraphState) -> dict:
    settings = get_settings()
    llm = ChatOpenAI(model=settings.openai_model, api_key=settings.openai_api_key, temperature=0.3)

    review_input = f"""Copy draft:
{state.get("copy_draft", "")}

Image prompt:
{state.get("image_prompt", "")}

Extracted brief:
{state.get("extracted", {})}
"""

    response = await llm.ainvoke(
        [
            SystemMessage(content=REVIEWER_SYSTEM),
            HumanMessage(content=review_input),
        ]
    )

    content = response.content
    if isinstance(content, list):
        content = "".join(str(part) for part in content)

    try:
        review: ReviewFeedback = json.loads(str(content))
    except json.JSONDecodeError:
        review = {
            "approved": True,
            "score": 75,
            "suggestions": ["Manual review recommended."],
            "revised_copy": state.get("copy_draft", ""),
        }

    return {"review": review}
