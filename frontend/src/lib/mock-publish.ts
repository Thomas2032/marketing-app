import type { CopyHistoryItem, PublishBatch, PublishQueueItem } from "@/types/publish";

const QUEUE_KEY_PREFIX = "mock-publish-queue:";
const BATCHES_KEY_PREFIX = "mock-publish-batches:";

function nowIso() {
  return new Date().toISOString();
}

function queueKey(projectId: string) {
  return `${QUEUE_KEY_PREFIX}${projectId}`;
}

function batchesKey(projectId: string) {
  return `${BATCHES_KEY_PREFIX}${projectId}`;
}

export function copyHistoryToQueueItem(item: CopyHistoryItem): PublishQueueItem {
  return {
    ...item,
    scheduledAt: null,
    status: "draft",
  };
}

export function getPublishQueue(projectId: string): PublishQueueItem[] {
  if (typeof window === "undefined") return [];

  const raw = window.sessionStorage.getItem(queueKey(projectId));
  if (!raw) return [];

  try {
    return JSON.parse(raw) as PublishQueueItem[];
  } catch {
    return [];
  }
}

export function savePublishQueue(projectId: string, items: PublishQueueItem[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(queueKey(projectId), JSON.stringify(items));
}

export function clearPublishQueue(projectId: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(queueKey(projectId));
}

export function addToPublishQueue(projectId: string, items: CopyHistoryItem[]): PublishQueueItem[] {
  const existing = getPublishQueue(projectId);
  const existingIds = new Set(existing.map((item) => item.id));
  const next = [...existing];

  for (const item of items) {
    if (existingIds.has(item.id)) continue;
    next.push(copyHistoryToQueueItem(item));
  }

  savePublishQueue(projectId, next);
  return next;
}

export function listPublishBatches(projectId: string): PublishBatch[] {
  if (typeof window === "undefined") return [];

  const raw = window.sessionStorage.getItem(batchesKey(projectId));
  if (!raw) return [];

  try {
    return JSON.parse(raw) as PublishBatch[];
  } catch {
    return [];
  }
}

function savePublishBatches(projectId: string, batches: PublishBatch[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(batchesKey(projectId), JSON.stringify(batches));
}

export async function submitPublishBatch(
  projectId: string,
  items: PublishQueueItem[],
): Promise<PublishBatch> {
  await new Promise((resolve) => window.setTimeout(resolve, 1500));

  const timestamp = nowIso();
  const finalized: PublishQueueItem[] = items.map((item) => ({
    ...item,
    status: item.scheduledAt ? "scheduled" : "published",
  }));

  const batch: PublishBatch = {
    id: `batch-${crypto.randomUUID()}`,
    projectId,
    items: finalized,
    createdAt: timestamp,
  };

  savePublishBatches(projectId, [batch, ...listPublishBatches(projectId)]);
  clearPublishQueue(projectId);

  return batch;
}

export const MOCK_CONNECTED_PLATFORMS_KEY = "mock-connected-platforms";

export function getMockConnectedPlatforms(): string[] {
  if (typeof window === "undefined") return ["LinkedIn", "X", "Instagram", "Facebook"];

  const raw = window.sessionStorage.getItem(MOCK_CONNECTED_PLATFORMS_KEY);
  if (!raw) return ["LinkedIn", "X", "Instagram", "Facebook"];

  try {
    return JSON.parse(raw) as string[];
  } catch {
    return ["LinkedIn", "X", "Instagram", "Facebook"];
  }
}

export function setMockConnectedPlatforms(platforms: string[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(MOCK_CONNECTED_PLATFORMS_KEY, JSON.stringify(platforms));
}
