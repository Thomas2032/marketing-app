import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.db.models import CampaignStatus


class CampaignCreate(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    title: str = Field(..., min_length=1, max_length=256)
    brief: str = Field(..., min_length=10)
    project_id: uuid.UUID | None = None
    brand_voice: str | None = None
    target_audience: str | None = None


class CampaignOutputRead(BaseModel):
    id: uuid.UUID
    output_type: str
    content: str | None
    asset_url: str | None
    metadata: dict = Field(default_factory=dict, validation_alias="metadata_")
    created_at: datetime

    model_config = {"from_attributes": True}


class CampaignRead(BaseModel):
    id: uuid.UUID
    user_id: str
    project_id: uuid.UUID | None = None
    title: str
    brief: str
    status: CampaignStatus
    state: dict
    error_message: str | None
    created_at: datetime
    updated_at: datetime
    outputs: list[CampaignOutputRead] = []

    model_config = {"from_attributes": True}


class CampaignRunResponse(BaseModel):
    campaign_id: uuid.UUID
    status: CampaignStatus
    job_id: str | None = None


class CampaignSummaryRead(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID | None = None
    title: str
    status: CampaignStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
