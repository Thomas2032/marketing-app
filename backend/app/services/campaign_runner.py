import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.orchestrator import run_campaign_pipeline
from app.db.models import Campaign, CampaignOutput, CampaignStatus, UserConfig


async def execute_campaign(campaign_id: str, db: AsyncSession | None = None) -> dict:
    """Run the orchestrator pipeline and persist outputs."""
    from app.db.session import async_session

    if db is not None:
        return await _run_campaign(campaign_id, db)

    async with async_session() as session:
        return await _run_campaign(campaign_id, session)


async def _run_campaign(campaign_id: str, session: AsyncSession) -> dict:
    try:
        result = await session.execute(
            select(Campaign).where(Campaign.id == uuid.UUID(campaign_id))
        )
        campaign = result.scalar_one_or_none()
        if not campaign:
            raise ValueError(f"Campaign {campaign_id} not found")

        campaign.status = CampaignStatus.RUNNING
        await session.commit()

        brand_voice = "professional"
        target_audience = "general"

        if campaign.user_config_id:
            config_result = await session.execute(
                select(UserConfig).where(UserConfig.id == campaign.user_config_id)
            )
            config = config_result.scalar_one_or_none()
            if config:
                brand_voice = config.brand_voice or brand_voice
                target_audience = config.target_audience or target_audience

        state = await run_campaign_pipeline(
            campaign_id=str(campaign.id),
            brief=campaign.brief,
            brand_voice=brand_voice,
            target_audience=target_audience,
        )

        outputs = [
            CampaignOutput(
                campaign_id=campaign.id,
                output_type="extracted",
                content=None,
                metadata_=state.get("extracted", {}),
            ),
            CampaignOutput(
                campaign_id=campaign.id,
                output_type="copy",
                content=state.get("copy_draft", ""),
            ),
            CampaignOutput(
                campaign_id=campaign.id,
                output_type="image",
                content=state.get("image_prompt", ""),
                asset_url=state.get("image_url") or None,
            ),
            CampaignOutput(
                campaign_id=campaign.id,
                output_type="review",
                content=state.get("review", {}).get("revised_copy"),
                metadata_=state.get("review", {}),
            ),
        ]
        session.add_all(outputs)

        campaign.state = dict(state)
        campaign.status = (
            CampaignStatus.COMPLETED
            if state.get("review", {}).get("approved", True)
            else CampaignStatus.REVIEW
        )
        await session.commit()

        return {"campaign_id": str(campaign.id), "status": campaign.status.value}

    except Exception as exc:
        await session.rollback()
        result = await session.execute(
            select(Campaign).where(Campaign.id == uuid.UUID(campaign_id))
        )
        campaign = result.scalar_one_or_none()
        if campaign:
            campaign.status = CampaignStatus.FAILED
            campaign.error_message = str(exc)
            await session.commit()
        raise
