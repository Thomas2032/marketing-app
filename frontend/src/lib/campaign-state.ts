import type {
  AgentToolName,
  Campaign,
  CampaignMessage,
  ToolCall,
} from "@/types/campaign";
import { agentToolNames } from "@/types/campaign";

export type OrchestratorUiState =
  | { kind: "idle" }
  | { kind: "orchestrating" }
  | { kind: "tool_running"; tool: AgentToolName }
  | { kind: "needs_review" }
  | { kind: "error"; message: string };

function isToolCall(value: unknown): value is ToolCall {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.tool_run_id === "string" &&
    typeof record.tool === "string" &&
    agentToolNames.includes(record.tool as AgentToolName) &&
    (record.status === "running" ||
      record.status === "completed" ||
      record.status === "failed")
  );
}

function isCampaignMessage(value: unknown): value is CampaignMessage {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    (record.role === "user" || record.role === "assistant") &&
    typeof record.content === "string" &&
    typeof record.created_at === "string"
  );
}

export function getToolCalls(campaign: Campaign): ToolCall[] {
  const raw = campaign.state.tool_calls;
  if (!Array.isArray(raw)) return [];
  return raw.filter(isToolCall);
}

export function getCampaignMessages(campaign: Campaign): CampaignMessage[] {
  const raw = campaign.state.messages;
  if (!Array.isArray(raw)) return [];
  return raw.filter(isCampaignMessage);
}

export function getLastCompletedTool(campaign: Campaign): AgentToolName | null {
  const value = campaign.state.last_completed_tool;
  if (typeof value !== "string") return null;
  return agentToolNames.includes(value as AgentToolName)
    ? (value as AgentToolName)
    : null;
}

export function isOrchestrating(campaign: Campaign): boolean {
  return campaign.status === "running" || campaign.status === "queued";
}

export function getOrchestratorUiState(campaign: Campaign): OrchestratorUiState {
  if (campaign.error_message) {
    return { kind: "error", message: campaign.error_message };
  }

  if (isOrchestrating(campaign)) {
    const active = getToolCalls(campaign).find((call) => call.status === "running");
    if (active) return { kind: "tool_running", tool: active.tool };
    return { kind: "orchestrating" };
  }

  if (campaign.status === "review" || campaign.status === "completed") {
    return { kind: "needs_review" };
  }

  return { kind: "idle" };
}
