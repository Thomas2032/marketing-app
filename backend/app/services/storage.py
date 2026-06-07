import uuid
from io import BytesIO

import boto3
from botocore.config import Config

from app.config import get_settings


def _get_s3_client():
    settings = get_settings()
    kwargs: dict = {
        "aws_access_key_id": settings.storage_access_key,
        "aws_secret_access_key": settings.storage_secret_key,
        "region_name": settings.storage_region,
        "config": Config(signature_version="s3v4"),
    }
    if settings.storage_endpoint_url:
        kwargs["endpoint_url"] = settings.storage_endpoint_url
    return boto3.client("s3", **kwargs)


def upload_bytes(
    *,
    key: str,
    data: bytes,
    content_type: str = "image/png",
) -> str:
    settings = get_settings()
    client = _get_s3_client()

    client.put_object(
        Bucket=settings.storage_bucket,
        Key=key,
        Body=data,
        ContentType=content_type,
    )

    if settings.storage_public_base_url:
        return f"{settings.storage_public_base_url.rstrip('/')}/{key}"

    if settings.storage_endpoint_url:
        return f"{settings.storage_endpoint_url.rstrip('/')}/{settings.storage_bucket}/{key}"

    return f"https://{settings.storage_bucket}.s3.{settings.storage_region}.amazonaws.com/{key}"


async def upload_generated_image(*, campaign_id: str, prompt: str) -> str:
    """Generate an image via OpenAI DALL-E and upload to S3/R2."""
    import httpx
    from openai import AsyncOpenAI

    settings = get_settings()
    client = AsyncOpenAI(api_key=settings.openai_api_key)

    response = await client.images.generate(
        model="dall-e-3",
        prompt=prompt[:1000],
        size="1024x1024",
        n=1,
    )

    image_url = response.data[0].url
    if not image_url:
        return ""

    async with httpx.AsyncClient() as http:
        img_response = await http.get(image_url)
        img_response.raise_for_status()
        image_bytes = img_response.content

    key = f"campaigns/{campaign_id}/{uuid.uuid4()}.png"
    return upload_bytes(key=key, data=image_bytes, content_type="image/png")
