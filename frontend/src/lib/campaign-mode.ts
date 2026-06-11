import type { Campaign, TaskType } from "@/types/campaign";
import { taskTypes } from "@/types/campaign";

export function getCampaignMode(campaign: Campaign): TaskType | null {
  const value = campaign.state.task_type;
  if (typeof value !== "string") return null;
  return taskTypes.includes(value as TaskType) ? (value as TaskType) : null;
}

/** First-turn loading copy while the orchestrator plans (mode is a hint only). */
export const modeLoadingLabels: Record<TaskType, string> = {
  Brainstorm: "Orchestrator is prioritizing brainstorm tools…",
  Copywriting: "Orchestrator is prioritizing copywriting tools…",
  "Visual Asset": "Orchestrator is prioritizing visual tools…",
};

export const defaultLoadingLabel = "Orchestrator is planning your campaign…";

export function getLoadingLabel(taskType: TaskType | null): string {
  if (!taskType) return defaultLoadingLabel;
  return modeLoadingLabels[taskType];
}

export function getModeAgentLabel(_taskType: TaskType | null): string {
  return "Orchestrator";
}
