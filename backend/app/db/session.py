from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings


class Base(DeclarativeBase):
    pass


settings = get_settings()
engine = create_async_engine(settings.database_url, echo=settings.debug)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db() -> None:
    from app.db import models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Add columns that may be missing on pre-existing tables (idempotent)
        await conn.execute(
            _text(
                "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS "
                "project_id UUID REFERENCES projects(id)"
            )
        )


def _text(sql: str):  # thin wrapper to avoid top-level sqlalchemy import at module scope
    from sqlalchemy import text
    return text(sql)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
