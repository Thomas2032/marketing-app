"""Optional Redis queue for long-running campaign jobs via arq."""

from arq import create_pool
from arq.connections import RedisSettings

from app.config import get_settings


async def get_redis_pool():
    settings = get_settings()
    return await create_pool(RedisSettings.from_dsn(settings.redis_url))


async def enqueue_campaign_run(campaign_id: str) -> str | None:
    """Enqueue a campaign pipeline job. Returns job id or None if queue disabled."""
    settings = get_settings()
    if not settings.use_queue:
        return None

    pool = await get_redis_pool()
    job = await pool.enqueue_job("run_campaign_job", campaign_id)
    return job.job_id if job else None


async def run_campaign_job(ctx: dict, campaign_id: str) -> dict:
    """arq worker entrypoint — import here to avoid circular imports."""
    from app.services.campaign_runner import execute_campaign

    return await execute_campaign(campaign_id)
