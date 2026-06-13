/**
 * Publish data layer.
 *
 * When USE_BACKEND=true  → calls the real API
 * When USE_BACKEND=false → reads/writes sessionStorage (no backend required)
 */
import type { CopyHistoryItem, PublishBatch, PublishQueueItem, SocialPlatform } from "@/types/publish";
import {
  apiAddToPublishQueue,
  apiConnectPlatform,
  apiDisconnectPlatform,
  apiGetConnectedPlatforms,
  apiGetPublishQueue,
  apiSubmitPublishBatch,
  apiUpdatePublishQueueItem,
} from "@/lib/api";
import { DEMO_USER_ID, USE_BACKEND } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Internal sessionStorage helpers (mock mode)
// ---------------------------------------------------------------------------

const QUEUE_KEY_PREFIX = "mock-publish-queue:";
const BATCHES_KEY_PREFIX = "mock-publish-batches:";
export const MOCK_CONNECTED_PLATFORMS_KEY = "mock-connected-platforms";

function nowIso() {
  return new Date().toISOString();
}

function _getQueue(projectId: string): PublishQueueItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.sessionStorage.getItem(`${QUEUE_KEY_PREFIX}${projectId}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PublishQueueItem[];
  } catch {
    return [];
  }
}

function _saveQueue(projectId: string, items: PublishQueueItem[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${QUEUE_KEY_PREFIX}${projectId}`, JSON.stringify(items));
}

function _getBatches(projectId: string): PublishBatch[] {
  if (typeof window === "undefined") return [];
  const raw = window.sessionStorage.getItem(`${BATCHES_KEY_PREFIX}${projectId}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PublishBatch[];
  } catch {
    return [];
  }
}

function _saveBatches(projectId: string, batches: PublishBatch[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${BATCHES_KEY_PREFIX}${projectId}`, JSON.stringify(batches));
}

// ---------------------------------------------------------------------------
// Converters
// ---------------------------------------------------------------------------

export function copyHistoryToQueueItem(item: CopyHistoryItem): PublishQueueItem {
  return {
    ...item,
    scheduledAt: null,
    status: "draft",
  };
}

// ---------------------------------------------------------------------------
// Public async API — Publish Queue
// ---------------------------------------------------------------------------

export async function getPublishQueue(projectId: string): Promise<PublishQueueItem[]> {
  if (USE_BACKEND) {
    const items = await apiGetPublishQueue(projectId, "draft");
    // Map API shape → frontend PublishQueueItem shape
    return items.map((item) => ({
      id: item.id,
      campaignId: item.campaign_id,
      campaignTitle: "",   // not stored in backend — filled by copy-history layer
      outputId: item.output_id,
      platform: item.platform,
      text: item.text,
      imageUrl: item.image_url,
      createdAt: item.created_at,
      scheduledAt: item.scheduled_at,
      status: item.status,
    }));
  }
  return _getQueue(projectId);
}

export async function savePublishQueue(
  projectId: string,
  items: PublishQueueItem[],
): Promise<void> {
  if (USE_BACKEND) {
    // Persist text / schedule changes for each item via PATCH
    await Promise.all(
      items.map((item) =>
        apiUpdatePublishQueueItem(projectId, item.id, {
          text: item.text,
          scheduled_at: item.scheduledAt ?? null,
        }),
      ),
    );
    return;
  }
  _saveQueue(projectId, items);
}

export async function clearPublishQueue(projectId: string): Promise<void> {
  if (USE_BACKEND) return; // backend clears queue when batch is created
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(`${QUEUE_KEY_PREFIX}${projectId}`);
  }
}

export async function addToPublishQueue(
  projectId: string,
  items: CopyHistoryItem[],
): Promise<PublishQueueItem[]> {
  if (USE_BACKEND) {
    await apiAddToPublishQueue(
      projectId,
      items.map((item) => ({
        campaign_id: item.campaignId,
        output_id: item.outputId,
        platform: item.platform,
        text: item.text,
        image_url: item.imageUrl ?? null,
        scheduled_at: null,
      })),
    );
    return getPublishQueue(projectId);
  }

  const existing = _getQueue(projectId);
  const existingIds = new Set(existing.map((i) => i.id));
  const next = [...existing];

  for (const item of items) {
    if (existingIds.has(item.id)) continue;
    next.push(copyHistoryToQueueItem(item));
  }

  _saveQueue(projectId, next);
  return next;
}

// ---------------------------------------------------------------------------
// Public async API — Publish Batches
// ---------------------------------------------------------------------------

export async function listPublishBatches(projectId: string): Promise<PublishBatch[]> {
  if (USE_BACKEND) {
    const batches = await import("@/lib/api").then((m) =>
      m.apiListPublishBatches(projectId),
    );
    return batches.map((b) => ({
      id: b.id,
      projectId: b.project_id,
      createdAt: b.created_at,
      items: b.items.map((item) => ({
        id: item.id,
        campaignId: item.campaign_id,
        campaignTitle: "",
        outputId: item.output_id,
        platform: item.platform,
        text: item.text,
        imageUrl: item.image_url,
        createdAt: item.created_at,
        scheduledAt: item.scheduled_at,
        status: item.status,
      })),
    }));
  }
  return _getBatches(projectId);
}

export async function submitPublishBatch(
  projectId: string,
  items: PublishQueueItem[],
): Promise<PublishBatch> {
  if (USE_BACKEND) {
    const batch = await apiSubmitPublishBatch(
      projectId,
      items.map((i) => i.id),
    );
    return {
      id: batch.id,
      projectId: batch.project_id,
      createdAt: batch.created_at,
      items: batch.items.map((item) => ({
        id: item.id,
        campaignId: item.campaign_id,
        campaignTitle: "",
        outputId: item.output_id,
        platform: item.platform,
        text: item.text,
        imageUrl: item.image_url,
        createdAt: item.created_at,
        scheduledAt: item.scheduled_at,
        status: item.status,
      })),
    };
  }

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

  _saveBatches(projectId, [batch, ..._getBatches(projectId)]);
  _saveQueue(projectId, []);

  return batch;
}

// ---------------------------------------------------------------------------
// Public async API — Connected Platforms
// ---------------------------------------------------------------------------

export async function getMockConnectedPlatforms(): Promise<SocialPlatform[]> {
  if (USE_BACKEND) {
    return apiGetConnectedPlatforms(DEMO_USER_ID);
  }

  if (typeof window === "undefined") return ["LinkedIn", "X", "Instagram", "Facebook"];
  const raw = window.sessionStorage.getItem(MOCK_CONNECTED_PLATFORMS_KEY);
  if (!raw) return ["LinkedIn", "X", "Instagram", "Facebook"];
  try {
    return JSON.parse(raw) as SocialPlatform[];
  } catch {
    return ["LinkedIn", "X", "Instagram", "Facebook"];
  }
}

export async function setMockConnectedPlatforms(
  platforms: SocialPlatform[],
  previous: SocialPlatform[] = [],
): Promise<void> {
  if (USE_BACKEND) {
    const added = platforms.filter((p) => !previous.includes(p));
    const removed = previous.filter((p) => !platforms.includes(p));
    await Promise.all([
      ...added.map((p) => apiConnectPlatform(DEMO_USER_ID, p)),
      ...removed.map((p) => apiDisconnectPlatform(DEMO_USER_ID, p)),
    ]);
    return;
  }

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(
      MOCK_CONNECTED_PLATFORMS_KEY,
      JSON.stringify(platforms),
    );
  }
}
