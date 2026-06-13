import type { Campaign, CampaignSummary, CreateCampaignPayload } from "@/types/campaign";
import type { Project } from "@/types/project";
import type { PublishQueueItem, SocialPlatform } from "@/types/publish";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }

  // 204 No Content — return undefined cast to T
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export async function createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
  return request<Campaign>("/campaigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listCampaigns(
  userId: string,
  limit = 20,
  projectId?: string,
): Promise<CampaignSummary[]> {
  const params = new URLSearchParams({ user_id: userId, limit: String(limit) });
  if (projectId) params.set("project_id", projectId);
  return request<CampaignSummary[]>(`/campaigns?${params.toString()}`);
}

export async function getCampaign(id: string): Promise<Campaign> {
  return request<Campaign>(`/campaigns/${id}`);
}

export async function runCampaign(id: string): Promise<{ campaign_id: string; status: string }> {
  return request(`/campaigns/${id}/run`, { method: "POST" });
}

export async function sendCampaignMessage(id: string, content: string): Promise<Campaign> {
  return request<Campaign>(`/campaigns/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function apiCreateProject(
  userId: string,
  name: string,
  description?: string | null,
): Promise<Project> {
  const body = await request<{
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  }>("/projects", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, name, description: description ?? null }),
  });
  return body;
}

export async function apiListProjects(userId: string): Promise<Project[]> {
  return request<Project[]>(`/projects?user_id=${encodeURIComponent(userId)}`);
}

export async function apiGetProject(id: string): Promise<Project> {
  return request<Project>(`/projects/${id}`);
}

export async function apiUpdateProject(
  id: string,
  patch: { name?: string; description?: string | null },
): Promise<Project> {
  return request<Project>(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function apiDeleteProject(id: string): Promise<void> {
  return request<void>(`/projects/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Publish Queue
// ---------------------------------------------------------------------------

export interface ApiPublishQueueItemCreate {
  campaign_id: string;
  output_id: string;
  platform: SocialPlatform;
  text: string;
  image_url?: string | null;
  scheduled_at?: string | null;
}

export interface ApiPublishQueueItemRead {
  id: string;
  project_id: string;
  campaign_id: string;
  output_id: string;
  batch_id: string | null;
  platform: SocialPlatform;
  text: string;
  image_url: string | null;
  scheduled_at: string | null;
  status: "draft" | "scheduled" | "published" | "failed";
  created_at: string;
}

export interface ApiPublishBatchRead {
  id: string;
  project_id: string;
  created_at: string;
  items: ApiPublishQueueItemRead[];
}

export async function apiGetPublishQueue(
  projectId: string,
  status?: string,
): Promise<ApiPublishQueueItemRead[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return request<ApiPublishQueueItemRead[]>(`/projects/${projectId}/publish/queue${qs}`);
}

export async function apiAddToPublishQueue(
  projectId: string,
  items: ApiPublishQueueItemCreate[],
): Promise<ApiPublishQueueItemRead[]> {
  return request<ApiPublishQueueItemRead[]>(`/projects/${projectId}/publish/queue`, {
    method: "POST",
    body: JSON.stringify(items),
  });
}

export async function apiUpdatePublishQueueItem(
  projectId: string,
  itemId: string,
  patch: { text?: string; status?: string; scheduled_at?: string | null },
): Promise<ApiPublishQueueItemRead> {
  return request<ApiPublishQueueItemRead>(
    `/projects/${projectId}/publish/queue/${itemId}`,
    { method: "PATCH", body: JSON.stringify(patch) },
  );
}

export async function apiDeletePublishQueueItem(
  projectId: string,
  itemId: string,
): Promise<void> {
  return request<void>(`/projects/${projectId}/publish/queue/${itemId}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// Publish Batches
// ---------------------------------------------------------------------------

export async function apiSubmitPublishBatch(
  projectId: string,
  itemIds: string[],
): Promise<ApiPublishBatchRead> {
  return request<ApiPublishBatchRead>(`/projects/${projectId}/publish/batches`, {
    method: "POST",
    body: JSON.stringify({ item_ids: itemIds }),
  });
}

export async function apiListPublishBatches(
  projectId: string,
): Promise<ApiPublishBatchRead[]> {
  return request<ApiPublishBatchRead[]>(`/projects/${projectId}/publish/batches`);
}

// ---------------------------------------------------------------------------
// Connected Platforms
// ---------------------------------------------------------------------------

export async function apiGetConnectedPlatforms(userId: string): Promise<SocialPlatform[]> {
  const rows = await request<{ id: string; platform: string }[]>(
    `/users/${encodeURIComponent(userId)}/platforms`,
  );
  return rows.map((r) => r.platform as SocialPlatform);
}

export async function apiConnectPlatform(
  userId: string,
  platform: SocialPlatform,
): Promise<void> {
  await request(`/users/${encodeURIComponent(userId)}/platforms`, {
    method: "POST",
    body: JSON.stringify({ platform }),
  });
}

export async function apiDisconnectPlatform(
  userId: string,
  platform: SocialPlatform,
): Promise<void> {
  // First fetch the platform record to get its UUID
  const rows = await request<{ id: string; platform: string }[]>(
    `/users/${encodeURIComponent(userId)}/platforms`,
  );
  const record = rows.find((r) => r.platform === platform);
  if (!record) return;
  await request(`/users/${encodeURIComponent(userId)}/platforms/${record.id}`, {
    method: "DELETE",
  });
}
