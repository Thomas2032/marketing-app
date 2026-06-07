"""arq worker — run with: arq app.worker.WorkerSettings"""

from arq.connections import RedisSettings

from app.config import get_settings
from app.services.queue import run_campaign_job


class WorkerSettings:
    settings = get_settings()
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
    functions = [run_campaign_job]
    max_jobs = 5
    job_timeout = 600
