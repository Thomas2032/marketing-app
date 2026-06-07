from langgraph.graph import END, StateGraph

from app.agents.nodes.extractor import extractor_node
from app.agents.nodes.image import image_node
from app.agents.nodes.reviewer import reviewer_node
from app.agents.nodes.writer import writer_node
from app.agents.state import CampaignGraphState


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
) -> CampaignGraphState:
    graph = get_campaign_graph()

    initial_state: CampaignGraphState = {
        "campaign_id": campaign_id,
        "brief": brief,
        "brand_voice": brand_voice,
        "target_audience": target_audience,
        "extracted": {},
        "copy_draft": "",
        "image_prompt": "",
        "image_url": "",
        "review": {},
        "messages": [],
        "errors": [],
    }

    result = await graph.ainvoke(initial_state)
    return result
