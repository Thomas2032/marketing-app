from datetime import datetime
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langgraph.graph import END, StateGraph

from app.agents.nodes.extractor import extractor_node
from app.agents.nodes.image import image_node
from app.agents.nodes.reviewer import reviewer_node
from app.agents.nodes.writer import writer_node
from app.agents.state import CampaignGraphState


def deserialize_messages(messages_list: list[dict]) -> list[BaseMessage]:
    deserialized = []
    for msg in messages_list:
        role = msg.get("role")
        content = msg.get("content", "")
        if role == "user":
            deserialized.append(HumanMessage(content=content))
        elif role == "assistant":
            deserialized.append(AIMessage(content=content))
    return deserialized


def serialize_messages(langchain_messages: list[BaseMessage]) -> list[dict]:
    serialized = []
    for msg in langchain_messages:
        if isinstance(msg, HumanMessage):
            role = "user"
        elif isinstance(msg, AIMessage):
            role = "assistant"
        else:
            msg_type = getattr(msg, "type", None)
            if msg_type == "human":
                role = "user"
            elif msg_type == "ai":
                role = "assistant"
            else:
                continue
        serialized.append({
            "role": role,
            "content": msg.content,
            "created_at": datetime.utcnow().isoformat() + "Z"
        })
    return serialized


def build_campaign_graph() -> StateGraph:
    """Orchestrator: extractor → writer → image → reviewer."""

    graph = StateGraph(CampaignGraphState)

    graph.add_node("extractor", extractor_node)
    graph.add_node("writer", writer_node)
    graph.add_node("image", image_node)
    graph.add_node("reviewer", reviewer_node)

    graph.set_entry_point("extractor")
    graph.add_edge("extractor", "writer")
    graph.add_edge("writer", "image")
    graph.add_edge("image", "reviewer")
    graph.add_edge("reviewer", END)

    return graph


_compiled_graph = None


def get_campaign_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_campaign_graph().compile()
    return _compiled_graph


async def run_campaign_pipeline(
    *,
    campaign_id: str,
    brief: str,
    brand_voice: str = "professional",
    target_audience: str = "general",
    existing_state: dict | None = None,
) -> CampaignGraphState:
    graph = get_campaign_graph()

    initial_state: CampaignGraphState = {
        "campaign_id": campaign_id,
        "brief": brief,
        "brand_voice": brand_voice,
        "target_audience": target_audience,
        "extracted": existing_state.get("extracted", {}) if existing_state else {},
        "copy_draft": existing_state.get("copy_draft", "") if existing_state else "",
        "image_prompt": existing_state.get("image_prompt", "") if existing_state else "",
        "image_url": existing_state.get("image_url", "") if existing_state else "",
        "review": existing_state.get("review", {}) if existing_state else {},
        "messages": deserialize_messages(existing_state.get("messages", [])) if existing_state else [],
        "errors": existing_state.get("errors", []) if existing_state else [],
    }

    result = await graph.ainvoke(initial_state)
    return result
