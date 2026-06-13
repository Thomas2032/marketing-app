import uuid
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_db
from app.config import get_settings
from app.db.models import Campaign, CampaignStatus, UserConfig
from app.schemas.campaign import (
    CampaignCreate,
    CampaignRead,
    CampaignRunResponse,
    CampaignSummaryRead,
)
from app.services.campaign_runner import execute_campaign
from app.services.queue import enqueue_campaign_run

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


class CampaignMessagePayload(BaseModel):
    content: str = Field(..., min_length=1)


@router.post("", response_model=CampaignRead, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    payload: CampaignCreate,
    db: AsyncSession = Depends(get_db),
) -> Campaign:
    user_config = None
    if payload.brand_voice or payload.target_audience:
        result = await db.execute(
            select(UserConfig).where(UserConfig.user_id == payload.user_id)
        )
        user_config = result.scalar_one_or_none()
        if user_config:
            if payload.brand_voice:
                user_config.brand_voice = payload.brand_voice
            if payload.target_audience:
                user_config.target_audience = payload.target_audience
        else:
            user_config = UserConfig(
                user_id=payload.user_id,
                brand_voice=payload.brand_voice,
                target_audience=payload.target_audience,
            )
            db.add(user_config)
            await db.flush()

    campaign = Campaign(
        user_id=payload.user_id,
        project_id=payload.project_id,
        title=payload.title,
        brief=payload.brief,
        user_config_id=user_config.id if user_config else None,
        status=CampaignStatus.DRAFT,
        state={
            "tool_calls": [],
            "messages": [{
                "role": "user",
                "content": payload.brief,
                "created_at": datetime.utcnow().isoformat() + "Z"
            }],
            "last_completed_tool": None
        }
    )
    db.add(campaign)
    await db.commit()
    result = await db.execute(
        select(Campaign)
        .options(selectinload(Campaign.outputs))
        .where(Campaign.id == campaign.id)
    )
    return result.scalar_one()


@router.get("", response_model=list[CampaignSummaryRead])
async def list_campaigns(
    user_id: str,
    project_id: uuid.UUID | None = None,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
) -> list[Campaign]:
    q = (
        select(Campaign)
        .where(Campaign.user_id == user_id)
        .order_by(Campaign.updated_at.desc())
        .limit(min(max(limit, 1), 50))
    )
    if project_id is not None:
        q = q.where(Campaign.project_id == project_id)
    result = await db.execute(q)
    return list(result.scalars().all())


@router.get("/{campaign_id}", response_model=CampaignRead)
async def get_campaign(
    campaign_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Campaign:
    result = await db.execute(
        select(Campaign)
        .options(selectinload(Campaign.outputs))
        .where(Campaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.post("/{campaign_id}/run", response_model=CampaignRunResponse)
async def run_campaign(
    campaign_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> CampaignRunResponse:
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    settings = get_settings()

    if settings.use_queue:
        campaign.status = CampaignStatus.QUEUED
        await db.commit()
        job_id = await enqueue_campaign_run(str(campaign_id))
        return CampaignRunResponse(
            campaign_id=campaign.id,
            status=CampaignStatus.QUEUED,
            job_id=job_id,
        )

    background_tasks.add_task(execute_campaign, str(campaign_id))
    campaign.status = CampaignStatus.RUNNING
    await db.commit()

    return CampaignRunResponse(
        campaign_id=campaign.id,
        status=CampaignStatus.RUNNING,
    )


@router.post("/{campaign_id}/messages", response_model=CampaignRead)
async def post_campaign_message(
    campaign_id: uuid.UUID,
    payload: CampaignMessagePayload,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
) -> Campaign:
    result = await db.execute(
        select(Campaign)
        .options(selectinload(Campaign.outputs))
        .where(Campaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    current_state = dict(campaign.state) if campaign.state else {}
    messages = list(current_state.get("messages", []))
    messages.append({
        "role": "user",
        "content": payload.content,
        "created_at": datetime.utcnow().isoformat() + "Z"
    })
    current_state["messages"] = messages
    current_state["tool_calls"] = []
    current_state["last_completed_tool"] = None

    campaign.state = current_state
    flag_modified(campaign, "state")

    settings = get_settings()
    if settings.use_queue:
        campaign.status = CampaignStatus.QUEUED
        await db.commit()
        await enqueue_campaign_run(str(campaign_id))
    else:
        campaign.status = CampaignStatus.RUNNING
        await db.commit()
        background_tasks.add_task(execute_campaign, str(campaign_id))

    await db.refresh(campaign)
    return campaign
