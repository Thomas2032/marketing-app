import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm.attributes import flag_modified

from app.db.session import async_session
from app.db.models import Campaign, CampaignOutput

async def db_start_tool_call(campaign_id: str, tool_name: str) -> str:
    """Inserts a tool call in 'running' status into the campaign state."""
    tool_run_id = f"tool-{uuid.uuid4()}"
    async with async_session() as session:
        result = await session.execute(
            select(Campaign).where(Campaign.id == uuid.UUID(campaign_id))
        )
        campaign = result.scalar_one_or_none()
        if campaign:
            current_state = dict(campaign.state) if campaign.state else {}
            tool_calls = list(current_state.get("tool_calls", []))

            tool_calls.append({
                "tool_run_id": tool_run_id,
                "tool": tool_name,
                "status": "running",
                "started_at": datetime.utcnow().isoformat() + "Z",
                "completed_at": None,
                "output_ref": None
            })
            current_state["tool_calls"] = tool_calls
            campaign.state = current_state
            flag_modified(campaign, "state")
            await session.commit()
    return tool_run_id

async def db_complete_tool_call(
    campaign_id: str,
    tool_run_id: str,
    tool_name: str,
    output_type: str,
    content: str | None,
    metadata_: dict | None = None,
    asset_url: str | None = None
) -> str:
    """Saves CampaignOutput incrementally and updates the tool call state."""
    async with async_session() as session:
        # Create or update campaign output of this type
        # (This prevents duplication if we run follow-ups)
        result_output = await session.execute(
            select(CampaignOutput)
            .where(CampaignOutput.campaign_id == uuid.UUID(campaign_id))
            .where(CampaignOutput.output_type == output_type)
        )
        existing_output = result_output.scalar_one_or_none()

        if existing_output:
            existing_output.content = content
            existing_output.asset_url = asset_url
            existing_output.metadata_ = metadata_ or {}
            output_id = existing_output.id
        else:
            campaign_output = CampaignOutput(
                campaign_id=uuid.UUID(campaign_id),
                output_type=output_type,
                content=content,
                metadata_=metadata_ or {},
                asset_url=asset_url
            )
            session.add(campaign_output)
            await session.flush()
            output_id = campaign_output.id

        # Update Campaign State
        result = await session.execute(
            select(Campaign).where(Campaign.id == uuid.UUID(campaign_id))
        )
        campaign = result.scalar_one_or_none()
        if campaign:
            current_state = dict(campaign.state) if campaign.state else {}
            tool_calls = list(current_state.get("tool_calls", []))

            for call in tool_calls:
                if call.get("tool_run_id") == tool_run_id:
                    call["status"] = "completed"
                    call["completed_at"] = datetime.utcnow().isoformat() + "Z"
                    call["output_ref"] = str(output_id)

            current_state["tool_calls"] = tool_calls
            current_state["last_completed_tool"] = tool_name

            # Save results in campaign.state incrementally for instant UI responsiveness
            if output_type == "extracted":
                current_state["extracted"] = metadata_ or {}
            elif output_type == "copy":
                current_state["copy_draft"] = content or ""
            elif output_type == "image":
                current_state["image_prompt"] = content or ""
                current_state["image_url"] = asset_url or ""
            elif output_type == "review":
                current_state["review"] = metadata_ or {}

            campaign.state = current_state
            flag_modified(campaign, "state")
            await session.commit()

        return str(output_id)

async def db_fail_tool_call(campaign_id: str, tool_run_id: str, tool_name: str):
    """Sets a tool call status to 'failed' on node errors."""
    async with async_session() as session:
        result = await session.execute(
            select(Campaign).where(Campaign.id == uuid.UUID(campaign_id))
        )
        campaign = result.scalar_one_or_none()
        if campaign:
            current_state = dict(campaign.state) if campaign.state else {}
            tool_calls = list(current_state.get("tool_calls", []))

            for call in tool_calls:
                if call.get("tool_run_id") == tool_run_id:
                    call["status"] = "failed"
                    call["completed_at"] = datetime.utcnow().isoformat() + "Z"

            current_state["tool_calls"] = tool_calls
            campaign.state = current_state
            flag_modified(campaign, "state")
            await session.commit()
