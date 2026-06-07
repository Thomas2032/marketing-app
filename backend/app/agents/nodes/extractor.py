import json

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.agents.state import CampaignGraphState, ExtractedBrief
from app.config import get_settings


EXTRACTOR_SYSTEM = """You are a marketing brief extractor. Parse the user's campaign brief into structured fields.
Return valid JSON only with keys: product, audience, tone, key_messages (array), constraints (array)."""


async def extractor_node(state: CampaignGraphState) -> dict:
    settings = get_settings()
    llm = ChatOpenAI(model=settings.openai_model, api_key=settings.openai_api_key, temperature=0.2)

    response = await llm.ainvoke(
        [
            SystemMessage(content=EXTRACTOR_SYSTEM),
            HumanMessage(content=state["brief"]),
        ]
    )

    content = response.content
    if isinstance(content, list):
        content = "".join(str(part) for part in content)

    try:
        parsed: ExtractedBrief = json.loads(str(content))
    except json.JSONDecodeError:
        parsed = {
            "product": state["brief"][:200],
            "audience": state.get("target_audience", "general"),
            "tone": state.get("brand_voice", "professional"),
            "key_messages": [],
            "constraints": [],
        }

    return {"extracted": parsed}
