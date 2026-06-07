from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.agents.state import CampaignGraphState
from app.config import get_settings


WRITER_SYSTEM = """You are an expert marketing copywriter. Write compelling campaign copy based on the extracted brief.
Include a headline, body copy, and call-to-action. Match the brand voice and target audience."""


async def writer_node(state: CampaignGraphState) -> dict:
    settings = get_settings()
    llm = ChatOpenAI(model=settings.openai_model, api_key=settings.openai_api_key, temperature=0.7)

    extracted = state.get("extracted", {})
    prompt = f"""Brand voice: {state.get("brand_voice", "professional")}
Target audience: {state.get("target_audience", "general")}

Extracted brief:
{extracted}

Original brief:
{state["brief"]}
"""

    response = await llm.ainvoke(
        [
            SystemMessage(content=WRITER_SYSTEM),
            HumanMessage(content=prompt),
        ]
    )

    content = response.content
    if isinstance(content, list):
        content = "".join(str(part) for part in content)

    return {"copy_draft": str(content)}
