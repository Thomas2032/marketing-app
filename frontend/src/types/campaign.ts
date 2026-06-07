export type CampaignStatus =
  | "draft"
  | "queued"
  | "running"
  | "review"
  | "completed"
  | "failed";

export interface CampaignOutput {
  id: string;
  output_type: string;
  content: string | null;
  asset_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  title: string;
  brief: string;
  status: CampaignStatus;
  state: Record<string, unknown>;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  outputs: CampaignOutput[];
}

export interface CreateCampaignPayload {
  user_id: string;
  title: string;
  brief: string;
  brand_voice?: string;
  target_audience?: string;
}

export interface CampaignSummary {
  id: string;
  title: string;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}
