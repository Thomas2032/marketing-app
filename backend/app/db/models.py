import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    QUEUED = "queued"
    RUNNING = "running"
    REVIEW = "review"
    COMPLETED = "completed"
    FAILED = "failed"


class UserConfig(Base):
    __tablename__ = "user_configs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    brand_voice: Mapped[str | None] = mapped_column(Text)
    target_audience: Mapped[str | None] = mapped_column(Text)
    preferences: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    campaigns: Mapped[list["Campaign"]] = relationship(back_populates="user_config")


class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[str] = mapped_column(String(128), index=True)
    user_config_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user_configs.id"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(256))
    brief: Mapped[str] = mapped_column(Text)
    status: Mapped[CampaignStatus] = mapped_column(
        Enum(CampaignStatus), default=CampaignStatus.DRAFT, index=True
    )
    state: Mapped[dict] = mapped_column(JSONB, default=dict)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user_config: Mapped["UserConfig | None"] = relationship(back_populates="campaigns")
    outputs: Mapped[list["CampaignOutput"]] = relationship(
        back_populates="campaign", cascade="all, delete-orphan"
    )


class CampaignOutput(Base):
    __tablename__ = "campaign_outputs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), index=True
    )
    output_type: Mapped[str] = mapped_column(String(64))  # copy, image, review, extracted
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    asset_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    campaign: Mapped["Campaign"] = relationship(back_populates="outputs")
