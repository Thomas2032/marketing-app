import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db
from app.db.models import ConnectedPlatform, PublishBatch, PublishPlatform, PublishQueueItem, PublishStatus
from app.schemas.publish import (
    ConnectedPlatformCreate,
    ConnectedPlatformRead,
    PublishBatchCreate,
    PublishBatchRead,
    PublishQueueItemCreate,
    PublishQueueItemRead,
    PublishQueueItemUpdate,
)

router = APIRouter(tags=["publish"])


# ---------------------------------------------------------------------------
# Queue
# ---------------------------------------------------------------------------

@router.get("/projects/{project_id}/publish/queue", response_model=list[PublishQueueItemRead])
async def list_queue(
    project_id: uuid.UUID,
    status: PublishStatus | None = None,
    db: AsyncSession = Depends(get_db),
) -> list[PublishQueueItem]:
    q = select(PublishQueueItem).where(PublishQueueItem.project_id == project_id)
    if status is not None:
        q = q.where(PublishQueueItem.status == status)
    q = q.order_by(PublishQueueItem.created_at.desc())
    result = await db.execute(q)
    return list(result.scalars().all())


@router.post(
    "/projects/{project_id}/publish/queue",
    response_model=list[PublishQueueItemRead],
    status_code=status.HTTP_201_CREATED,
)
async def add_to_queue(
    project_id: uuid.UUID,
    items: list[PublishQueueItemCreate],
    db: AsyncSession = Depends(get_db),
) -> list[PublishQueueItem]:
    created = []
    for item in items:
        record = PublishQueueItem(
            project_id=project_id,
            campaign_id=item.campaign_id,
            output_id=item.output_id,
            platform=item.platform,
            text=item.text,
            image_url=item.image_url,
            scheduled_at=item.scheduled_at,
            status=PublishStatus.DRAFT,
        )
        db.add(record)
        created.append(record)
    await db.commit()
    for record in created:
        await db.refresh(record)
    return created


@router.patch("/projects/{project_id}/publish/queue/{item_id}", response_model=PublishQueueItemRead)
async def update_queue_item(
    project_id: uuid.UUID,
    item_id: uuid.UUID,
    payload: PublishQueueItemUpdate,
    db: AsyncSession = Depends(get_db),
) -> PublishQueueItem:
    result = await db.execute(
        select(PublishQueueItem).where(
            PublishQueueItem.id == item_id,
            PublishQueueItem.project_id == project_id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Queue item not found")
    if payload.text is not None:
        item.text = payload.text
    if payload.status is not None:
        item.status = payload.status
    if payload.scheduled_at is not None:
        item.scheduled_at = payload.scheduled_at
    await db.commit()
    await db.refresh(item)
    return item


@router.delete(
    "/projects/{project_id}/publish/queue/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_queue_item(
    project_id: uuid.UUID,
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(PublishQueueItem).where(
            PublishQueueItem.id == item_id,
            PublishQueueItem.project_id == project_id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Queue item not found")
    await db.delete(item)
    await db.commit()


# ---------------------------------------------------------------------------
# Batches
# ---------------------------------------------------------------------------

@router.get("/projects/{project_id}/publish/batches", response_model=list[PublishBatchRead])
async def list_batches(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[PublishBatch]:
    result = await db.execute(
        select(PublishBatch)
        .options(selectinload(PublishBatch.items))
        .where(PublishBatch.project_id == project_id)
        .order_by(PublishBatch.created_at.desc())
    )
    return list(result.scalars().all())


@router.post(
    "/projects/{project_id}/publish/batches",
    response_model=PublishBatchRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_batch(
    project_id: uuid.UUID,
    payload: PublishBatchCreate,
    db: AsyncSession = Depends(get_db),
) -> PublishBatch:
    # Verify all items belong to this project
    result = await db.execute(
        select(PublishQueueItem).where(
            PublishQueueItem.id.in_(payload.item_ids),
            PublishQueueItem.project_id == project_id,
        )
    )
    items = list(result.scalars().all())
    if len(items) != len(payload.item_ids):
        raise HTTPException(status_code=404, detail="One or more queue items not found")

    batch = PublishBatch(project_id=project_id)
    db.add(batch)
    await db.flush()  # get batch.id

    for item in items:
        item.batch_id = batch.id
        item.status = PublishStatus.PUBLISHED

    await db.commit()
    result = await db.execute(
        select(PublishBatch)
        .options(selectinload(PublishBatch.items))
        .where(PublishBatch.id == batch.id)
    )
    return result.scalar_one()


@router.get("/projects/{project_id}/publish/batches/{batch_id}", response_model=PublishBatchRead)
async def get_batch(
    project_id: uuid.UUID,
    batch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> PublishBatch:
    result = await db.execute(
        select(PublishBatch)
        .options(selectinload(PublishBatch.items))
        .where(PublishBatch.id == batch_id, PublishBatch.project_id == project_id)
    )
    batch = result.scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


# ---------------------------------------------------------------------------
# Connected Platforms (user-scoped)
# ---------------------------------------------------------------------------

@router.get("/users/{user_id}/platforms", response_model=list[ConnectedPlatformRead])
async def list_platforms(
    user_id: str,
    db: AsyncSession = Depends(get_db),
) -> list[ConnectedPlatform]:
    result = await db.execute(
        select(ConnectedPlatform).where(ConnectedPlatform.user_id == user_id)
    )
    return list(result.scalars().all())


@router.post(
    "/users/{user_id}/platforms",
    response_model=ConnectedPlatformRead,
    status_code=status.HTTP_201_CREATED,
)
async def connect_platform(
    user_id: str,
    payload: ConnectedPlatformCreate,
    db: AsyncSession = Depends(get_db),
) -> ConnectedPlatform:
    # Check if already connected
    result = await db.execute(
        select(ConnectedPlatform).where(
            ConnectedPlatform.user_id == user_id,
            ConnectedPlatform.platform == payload.platform,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    record = ConnectedPlatform(user_id=user_id, platform=payload.platform)
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


@router.delete("/users/{user_id}/platforms/{platform_id}", status_code=status.HTTP_204_NO_CONTENT)
async def disconnect_platform(
    user_id: str,
    platform_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(ConnectedPlatform).where(
            ConnectedPlatform.id == platform_id,
            ConnectedPlatform.user_id == user_id,
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Platform connection not found")
    await db.delete(record)
    await db.commit()
