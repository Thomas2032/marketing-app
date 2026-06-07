import type { Campaign, CampaignSummary, CreateCampaignPayload } from "@/types/campaign";

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

  return response.json() as Promise<T>;
}

export async function createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
  return request<Campaign>("/campaigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listCampaigns(
  userId: string,
  limit = 20,
): Promise<CampaignSummary[]> {
  const params = new URLSearchParams({ user_id: userId, limit: String(limit) });
  return request<CampaignSummary[]>(`/campaigns?${params.toString()}`);
}

export async function getCampaign(id: string): Promise<Campaign> {
  return request<Campaign>(`/campaigns/${id}`);
}

export async function runCampaign(id: string): Promise<{ campaign_id: string; status: string }> {
  return request(`/campaigns/${id}/run`, { method: "POST" });
}
