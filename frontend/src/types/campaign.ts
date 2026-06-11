export const taskTypes = ["Brainstorm", "Copywriting", "Visual Asset"] as const;
export type TaskType = (typeof taskTypes)[number];

export const agentToolNames = [
  "quality_gate",
  "extract_brief",
  "brainstorm_angles",
  "write_copy",
  "generate_visual",
  "review_outputs",
] as const;
export type AgentToolName = (typeof agentToolNames)[number];

export type ToolCallStatus = "running" | "completed" | "failed";

export interface ToolCall {
  tool_run_id: string;
  tool: AgentToolName;
  status: ToolCallStatus;
  output_ref?: string | null;
  started_at: string;
  completed_at?: string | null;
}

export interface CampaignMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

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
  project_id?: string | null;
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
  project_id?: string | null;
  title: string;
  status: CampaignStatus;
  task_type?: TaskType | null;
  created_at: string;
  updated_at: string;
}
