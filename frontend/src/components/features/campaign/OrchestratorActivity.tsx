import type { AgentToolName, Campaign } from "@/types/campaign";
import { getOrchestratorUiState, getToolCalls, isOrchestrating } from "@/lib/campaign-state";
import { toolLabels, toolTasks } from "@/lib/orchestrator-tools";
import { cn } from "@/lib/utils";
import {
  AiMessage,
  ContextCard,
} from "@/components/features/campaign/ConversationMessages";
import { TypingIndicator } from "@/components/features/campaign/TypingIndicator";

type OrchestratorActivityProps = {
  campaign: Campaign;
};

export function OrchestratorActivity({ campaign }: OrchestratorActivityProps) {
  const toolCalls = getToolCalls(campaign);
  const uiState = getOrchestratorUiState(campaign);
  const processing = isOrchestrating(campaign);
  const activeTool = uiState.kind === "tool_running" ? uiState.tool : null;

  return (
    <>
      <ContextCard title="Orchestrator">
        {toolCalls.length === 0 && processing ? (
          <p className="text-sm text-slate-600">Planning which tools to run…</p>
        ) : (
          <ToolCallList toolCalls={toolCalls} processing={processing} activeTool={activeTool} />
        )}
      </ContextCard>

      {processing && (
        <AiMessage agent="Orchestrator">
          <TypingIndicator
            label={
              activeTool
                ? toolTasks[activeTool]
                : "Reasoning about your brief and selecting tools…"
            }
          />
        </AiMessage>
      )}

      {uiState.kind === "error" && (
        <ContextCard title="Orchestrator error" variant="error">
          {uiState.message}
        </ContextCard>
      )}
    </>
  );
}

type ToolCallListProps = {
  toolCalls: ReturnType<typeof getToolCalls>;
  processing: boolean;
  activeTool: AgentToolName | null;
};

function ToolCallList({ toolCalls, processing, activeTool }: ToolCallListProps) {
  return (
    <ol className="space-y-2">
      {toolCalls.map((call) => {
        const isActive = call.status === "running" || call.tool === activeTool;
        const isDone = call.status === "completed";
        const isFailed = call.status === "failed";

        return (
          <li
            key={call.tool_run_id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm",
              isDone && "border-emerald-200 bg-emerald-50/40",
              isActive && processing && "border-violet-300 bg-violet-50/50",
              isFailed && "border-red-200 bg-red-50/40",
              !isDone && !isActive && !isFailed && "border-slate-200 bg-white",
            )}
          >
            <span
              className={cn(
                "font-medium",
                isDone && "text-emerald-700",
                isActive && processing && "text-violet-700",
                isFailed && "text-red-700",
                !isDone && !isActive && !isFailed && "text-slate-500",
              )}
            >
              {toolLabels[call.tool]}
            </span>
            <span className="text-xs capitalize text-slate-500">{call.status}</span>
          </li>
        );
      })}
    </ol>
  );
}
