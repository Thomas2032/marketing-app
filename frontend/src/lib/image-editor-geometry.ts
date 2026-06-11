export type RenderRect = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

export function getImageRenderRect(
  containerWidth: number,
  containerHeight: number,
  naturalWidth: number,
  naturalHeight: number,
): RenderRect {
  if (naturalWidth === 0 || naturalHeight === 0) {
    return { offsetX: 0, offsetY: 0, width: containerWidth, height: containerHeight };
  }

  const containerAspect = containerWidth / containerHeight;
  const imageAspect = naturalWidth / naturalHeight;

  if (imageAspect > containerAspect) {
    const width = containerWidth;
    const height = containerWidth / imageAspect;
    return {
      offsetX: 0,
      offsetY: (containerHeight - height) / 2,
      width,
      height,
    };
  }

  const height = containerHeight;
  const width = containerHeight * imageAspect;
  return {
    offsetX: (containerWidth - width) / 2,
    offsetY: 0,
    width,
    height,
  };
}

export function clientToNormalized(
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  renderRect: RenderRect,
) {
  const localX = clientX - containerRect.left - renderRect.offsetX;
  const localY = clientY - containerRect.top - renderRect.offsetY;

  return {
    x: clamp(localX / renderRect.width, 0, 1),
    y: clamp(localY / renderRect.height, 0, 1),
  };
}

export function normalizedToPercent(value: number) {
  return `${value * 100}%`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeRect(
  start: { x: number; y: number },
  end: { x: number; y: number },
  minSize = 0.02,
) {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.max(Math.abs(end.x - start.x), minSize);
  const height = Math.max(Math.abs(end.y - start.y), minSize);

  return {
    x: clamp(x, 0, 1 - width),
    y: clamp(y, 0, 1 - height),
    width: clamp(width, minSize, 1 - x),
    height: clamp(height, minSize, 1 - y),
  };
}
