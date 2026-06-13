import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.db.models import PublishPlatform, PublishStatus


class PublishQueueItemCreate(BaseModel):
    campaign_id: uuid.UUID
    output_id: uuid.UUID
    platform: PublishPlatform
    text: str = Field(..., min_length=1)
    image_url: str | None = None
    scheduled_at: datetime | None = None


class PublishQueueItemUpdate(BaseModel):
    text: str | None = Field(None, min_length=1)
    status: PublishStatus | None = None
    scheduled_at: datetime | None = None


class PublishQueueItemRead(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    campaign_id: uuid.UUID
    output_id: uuid.UUID
    batch_id: uuid.UUID | None
    platform: PublishPlatform
    text: str
    image_url: str | None
    scheduled_at: datetime | None
    status: PublishStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class PublishBatchCreate(BaseModel):
    item_ids: list[uuid.UUID] = Field(..., min_length=1)


class PublishBatchRead(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime
    items: list[PublishQueueItemRead] = []

    model_config = {"from_attributes": True}


class ConnectedPlatformCreate(BaseModel):
    platform: PublishPlatform


class ConnectedPlatformRead(BaseModel):
    id: uuid.UUID
    user_id: str
    platform: PublishPlatform
    connected_at: datetime

    model_config = {"from_attributes": True}
