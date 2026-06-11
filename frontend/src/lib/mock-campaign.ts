import type { Campaign, CampaignSummary, TaskType } from "@/types/campaign";
import { DEMO_USER_ID } from "@/lib/constants";
import {
  appendUserMessage,
  runMockFollowUpTurn,
  runMockOrchestratorTurn,
} from "@/lib/mock-orchestrator";
import {
  mockCopyOutput,
  mockImageOutput,
  mockReviewOutput,
} from "@/lib/mock-outputs";

export { appendUserMessage, runMockFollowUpTurn, runMockOrchestratorTurn };

export const MOCK_CAMPAIGN_ID = "demo";

const STORAGE_KEY = "mock-campaign";
const SUMMARIES_KEY = "mock-campaign-summaries";

function nowIso() {
  return new Date().toISOString();
}

export function createMockCampaignId(): string {
  return `mock-${crypto.randomUUID()}`;
}

function getSummaryTaskType(campaign: Campaign): TaskType | null {
  const value = campaign.state.task_type;
  if (value === "Brainstorm" || value === "Copywriting" || value === "Visual Asset") {
    return value;
  }
  return null;
}

export type MockCampaignInput = {
  id?: string;
  projectId: string;
  title: string;
  brief: string;
  brandVoice?: string;
  targetAudience?: string;
  taskType?: TaskType | null;
};

function buildCampaignState(input: MockCampaignInput): Campaign["state"] {
  const timestamp = nowIso();
  return {
    brand_voice: input.brandVoice ?? "professional",
    target_audience: input.targetAudience ?? null,
    orchestrator_turn_at: timestamp,
    tool_calls: [],
    last_completed_tool: null,
    messages: [{ role: "user", content: input.brief, created_at: timestamp }],
    ...(input.taskType ? { task_type: input.taskType } : {}),
  };
}

export function createInitialMockCampaign(input: MockCampaignInput): Campaign {
  const timestamp = nowIso();
  return {
    id: input.id ?? createMockCampaignId(),
    user_id: DEMO_USER_ID,
    project_id: input.projectId,
    title: input.title,
    brief: input.brief,
    status: "running",
    state: buildCampaignState(input),
    error_message: null,
    created_at: timestamp,
    updated_at: timestamp,
    outputs: [],
  };
}

export function getDefaultMockCampaign(id: string = MOCK_CAMPAIGN_ID): Campaign {
  const timestamp = nowIso();
  return {
    id,
    user_id: DEMO_USER_ID,
    title: "Summer product launch",
    brief:
      "Summer product launch for our SaaS analytics tool. Target: growth marketers. Highlight 40% faster setup and launch-week urgency.",
    status: "completed",
    state: {
      brand_voice: "professional",
      target_audience: "growth marketers",
      tool_calls: [],
      messages: [
        {
          role: "user",
          content:
            "Summer product launch for our SaaS analytics tool. Target: growth marketers. Highlight 40% faster setup and launch-week urgency.",
          created_at: timestamp,
        },
      ],
    },
    error_message: null,
    created_at: timestamp,
    updated_at: timestamp,
    outputs: [mockCopyOutput(), mockImageOutput(), mockReviewOutput()],
  };
}

export function saveMockCampaign(campaign: Campaign) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(`${STORAGE_KEY}:${campaign.id}`, JSON.stringify(campaign));

  const summary: CampaignSummary = {
    id: campaign.id,
    project_id: campaign.project_id ?? null,
    title: campaign.title,
    status: campaign.status,
    task_type: getSummaryTaskType(campaign),
    created_at: campaign.created_at,
    updated_at: campaign.updated_at,
  };

  const existing = listMockCampaignSummaries().filter((item) => item.id !== campaign.id);
  window.sessionStorage.setItem(SUMMARIES_KEY, JSON.stringify([summary, ...existing]));
}

export function getMockCampaign(id: string): Campaign | null {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(`${STORAGE_KEY}:${id}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Campaign;
  } catch {
    return null;
  }
}

export function listMockCampaignSummaries(projectId?: string): CampaignSummary[] {
  if (typeof window === "undefined") return [];

  const raw = window.sessionStorage.getItem(SUMMARIES_KEY);
  if (!raw) return [];

  try {
    const summaries = JSON.parse(raw) as CampaignSummary[];
    if (!projectId) return summaries;
    return summaries.filter((item) => item.project_id === projectId);
  } catch {
    return [];
  }
}

export function renameMockCampaign(id: string, title: string) {
  if (typeof window === "undefined") return;

  const timestamp = nowIso();
  const campaign = getMockCampaign(id);

  if (campaign) {
    saveMockCampaign({ ...campaign, title, updated_at: timestamp });
    return;
  }

  const summaries = listMockCampaignSummaries();
  const summary = summaries.find((item) => item.id === id);
  if (!summary) return;

  const nextSummaries = summaries.map((item) =>
    item.id === id ? { ...item, title, updated_at: timestamp } : item,
  );
  window.sessionStorage.setItem(SUMMARIES_KEY, JSON.stringify(nextSummaries));
}

export function deleteMockCampaign(id: string) {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(`${STORAGE_KEY}:${id}`);
  const nextSummaries = listMockCampaignSummaries().filter((item) => item.id !== id);
  window.sessionStorage.setItem(SUMMARIES_KEY, JSON.stringify(nextSummaries));
}

export function runMockPipeline(
  base: Campaign,
  onStage: (campaign: Campaign) => void,
): () => void {
  const stop = runMockOrchestratorTurn(base, (campaign) => {
    onStage(campaign);
    saveMockCampaign(campaign);
  });

  return stop;
}
