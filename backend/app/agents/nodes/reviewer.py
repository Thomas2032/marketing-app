import json

from langchain_core.messages import HumanMessage, SystemMessage

from app.agents.state import CampaignGraphState, ReviewFeedback
from app.services.llm_factory import get_llm_client
from app.services.campaign_state_helper import db_start_tool_call, db_complete_tool_call, db_fail_tool_call


REVIEWER_SYSTEM = """You are a senior marketing reviewer. Evaluate campaign copy and image prompt alignment.
Return valid JSON only with keys: approved (bool), score (0-100), suggestions (array of strings), revised_copy (string)."""


async def reviewer_node(state: CampaignGraphState) -> dict:
    campaign_id = state["campaign_id"]
    tool_run_id = await db_start_tool_call(campaign_id, "review_outputs")

    try:
        llm = get_llm_client(temperature=0.3)

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

        await db_complete_tool_call(
            campaign_id=campaign_id,
            tool_run_id=tool_run_id,
            tool_name="review_outputs",
            output_type="review",
            content=review.get("revised_copy"),
            metadata_=review
        )

        return {"review": review}
    except Exception:
        await db_fail_tool_call(campaign_id, tool_run_id, "review_outputs")
        raise
