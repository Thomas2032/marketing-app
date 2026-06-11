import type {
  AgentToolName,
  Campaign,
  CampaignMessage,
  CampaignOutput,
  TaskType,
  ToolCall,
} from "@/types/campaign";
import { getCampaignMode } from "@/lib/campaign-mode";
import { getPreferredToolsForMode } from "@/lib/orchestrator-tools";
import {
  mockBrainstormOutput,
  mockCopyOutput,
  mockCopywritingOutput,
  mockImageOutput,
  mockReviewOutput,
  mockVisualAssetOutput,
} from "@/lib/mock-outputs";

function nowIso() {
  return new Date().toISOString();
}

function createToolRunId() {
  return `tool-${crypto.randomUUID()}`;
}

type MockOrchestratorStage = {
  delay: number;
  campaign: Campaign;
};

type ToolEffect = {
  outputs: CampaignOutput[];
  outputRef?: string | null;
};

function partialBrainstormOutput(): CampaignOutput {
  const full = mockBrainstormOutput();
  return {
    ...full,
    id: "mock-brainstorm-partial",
    metadata: {
      ...full.metadata,
      angles: (full.metadata.angles as unknown[]).slice(0, 2),
      quotes: [],
    },
  };
}

function partialCopywritingOutput(): CampaignOutput {
  const full = mockCopywritingOutput();
  const platforms = full.metadata.platforms as Record<string, string>;
  return {
    ...full,
    id: "mock-copywriting-partial",
    metadata: {
      platforms: {
        LinkedIn: platforms.LinkedIn,
        X: platforms.X,
      },
    },
  };
}

function partialVisualOutput(): CampaignOutput {
  const full = mockVisualAssetOutput();
  return {
    ...full,
    id: "mock-visual-variants",
    asset_url: null,
    metadata: {
      ...full.metadata,
      variants: (full.metadata.variants as unknown[]).slice(0, 2),
    },
  };
}

function conceptVisualOutput(): CampaignOutput {
  const full = mockVisualAssetOutput();
  return {
    ...full,
    id: "mock-visual-concept",
    asset_url: null,
    metadata: {
      prompt: full.metadata.prompt,
      source: "dall-e",
      variants: [],
    },
  };
}

function applyToolEffect(
  tool: AgentToolName,
  mode: TaskType | null,
  phase: "running" | "completed",
  priorOutputs: CampaignOutput[],
): ToolEffect {
  switch (tool) {
    case "quality_gate":
    case "extract_brief":
      return { outputs: priorOutputs };

    case "brainstorm_angles": {
      const output = phase === "running" ? partialBrainstormOutput() : mockBrainstormOutput();
      return {
        outputs: replaceOutput(priorOutputs, "brainstorm", output),
        outputRef: output.id,
      };
    }

    case "write_copy": {
      if (mode === "Copywriting") {
        const output =
          phase === "running" ? partialCopywritingOutput() : mockCopywritingOutput();
        return {
          outputs: replaceOutput(priorOutputs, "copy", output),
          outputRef: output.id,
        };
      }
      const output = mockCopyOutput();
      return {
        outputs: replaceOutput(priorOutputs, "copy", output),
        outputRef: output.id,
      };
    }

    case "generate_visual": {
      if (mode === "Visual Asset") {
        if (phase === "running") {
          const hasConcept = priorOutputs.some((o) => o.id === "mock-visual-concept");
          const output = hasConcept ? partialVisualOutput() : conceptVisualOutput();
          return {
            outputs: replaceOutput(priorOutputs, "image", output),
            outputRef: output.id,
          };
        }
        const output = mockVisualAssetOutput();
        return {
          outputs: replaceOutput(priorOutputs, "image", output),
          outputRef: output.id,
        };
      }
      const output = mockImageOutput();
      return {
        outputs: replaceOutput(priorOutputs, "image", output),
        outputRef: output.id,
      };
    }

    case "review_outputs": {
      if (mode === "Copywriting") {
        return { outputs: priorOutputs };
      }
      const output = mockReviewOutput();
      return {
        outputs: [...priorOutputs, output],
        outputRef: output.id,
      };
    }

    default:
      return { outputs: priorOutputs };
  }
}

function replaceOutput(
  outputs: CampaignOutput[],
  outputType: string,
  next: CampaignOutput,
): CampaignOutput[] {
  const withoutType = outputs.filter((output) => output.output_type !== outputType);
  return [...withoutType, next];
}

function snapshotCampaign(
  base: Campaign,
  patch: {
    status?: Campaign["status"];
    outputs?: CampaignOutput[];
    toolCalls?: ToolCall[];
    lastCompletedTool?: AgentToolName | null;
    messages?: CampaignMessage[];
  },
): Campaign {
  return {
    ...base,
    status: patch.status ?? base.status,
    outputs: patch.outputs ?? base.outputs,
    state: {
      ...base.state,
      ...(patch.toolCalls !== undefined ? { tool_calls: patch.toolCalls } : {}),
      ...(patch.lastCompletedTool !== undefined
        ? { last_completed_tool: patch.lastCompletedTool }
        : {}),
      ...(patch.messages !== undefined ? { messages: patch.messages } : {}),
    },
    updated_at: nowIso(),
  };
}

type BuildStagesOptions = {
  tools?: AgentToolName[];
  preserveOutputs?: boolean;
};

export function buildMockOrchestratorStages(
  base: Campaign,
  options: BuildStagesOptions = {},
): MockOrchestratorStage[] {
  const mode = getCampaignMode(base);
  const tools = options.tools ?? getPreferredToolsForMode(mode);
  const stages: MockOrchestratorStage[] = [];
  let delay = 400;
  let outputs: CampaignOutput[] = options.preserveOutputs ? [...base.outputs] : [];
  let toolCalls: ToolCall[] = [];

  stages.push({
    delay,
    campaign: snapshotCampaign(base, {
      status: "running",
      outputs: options.preserveOutputs ? [...base.outputs] : [],
      toolCalls: [],
      lastCompletedTool: null,
    }),
  });

  for (const tool of tools) {
    const toolRunId = createToolRunId();
    const startedAt = nowIso();
    const runningCall: ToolCall = {
      tool_run_id: toolRunId,
      tool,
      status: "running",
      started_at: startedAt,
    };

    toolCalls = [...toolCalls, runningCall];
    delay += tool === "generate_visual" && mode === "Visual Asset" ? 1200 : 1000;

    const runningEffect = applyToolEffect(tool, mode, "running", outputs);
    outputs = runningEffect.outputs;

    stages.push({
      delay,
      campaign: snapshotCampaign(base, {
        status: "running",
        outputs,
        toolCalls,
      }),
    });

    if (tool === "generate_visual" && mode === "Visual Asset") {
      delay += 1200;
      const midEffect = applyToolEffect(tool, mode, "running", outputs);
      outputs = midEffect.outputs;
      stages.push({
        delay,
        campaign: snapshotCampaign(base, {
          status: "running",
          outputs,
          toolCalls,
        }),
      });
    }

    const completedEffect = applyToolEffect(tool, mode, "completed", outputs);
    outputs = completedEffect.outputs;

    toolCalls = toolCalls.map((call) =>
      call.tool_run_id === toolRunId
        ? {
            ...call,
            status: "completed",
            completed_at: nowIso(),
            output_ref: completedEffect.outputRef ?? null,
          }
        : call,
    );

    delay += 400;
    stages.push({
      delay,
      campaign: snapshotCampaign(base, {
        status: "running",
        outputs,
        toolCalls,
        lastCompletedTool: tool,
      }),
    });
  }

  delay += 400;
  stages.push({
    delay,
    campaign: snapshotCampaign(base, {
      status: "completed",
      outputs,
      toolCalls,
      lastCompletedTool: tools[tools.length - 1] ?? null,
    }),
  });

  return stages;
}

export function runMockOrchestratorTurn(
  base: Campaign,
  onStage: (campaign: Campaign) => void,
  options: BuildStagesOptions = {},
): () => void {
  const timeouts = buildMockOrchestratorStages(base, options).map(({ delay, campaign }) =>
    window.setTimeout(() => onStage(campaign), delay),
  );

  return () => {
    timeouts.forEach((timeout) => window.clearTimeout(timeout));
  };
}

export function appendUserMessage(campaign: Campaign, content: string): Campaign {
  const messages = Array.isArray(campaign.state.messages)
    ? [...(campaign.state.messages as CampaignMessage[])]
    : [];

  messages.push({
    role: "user",
    content,
    created_at: nowIso(),
  });

  return snapshotCampaign(campaign, {
    messages,
    status: "running",
    toolCalls: [],
    lastCompletedTool: null,
  });
}

export function runMockFollowUpTurn(
  base: Campaign,
  onStage: (campaign: Campaign) => void,
): () => void {
  const mode = getCampaignMode(base);
  const followUpTools: AgentToolName[] =
    mode === "Brainstorm"
      ? ["brainstorm_angles"]
      : mode === "Visual Asset"
        ? ["generate_visual"]
        : ["write_copy", "review_outputs"];

  return runMockOrchestratorTurn(base, onStage, {
    tools: followUpTools,
    preserveOutputs: true,
  });
}
