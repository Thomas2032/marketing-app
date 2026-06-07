"use client";

import { useEffect, useState } from "react";
import type { Campaign } from "@/types/campaign";
import { getCampaign } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  AiMessage,
  ContextCard,
  UserMessage,
} from "@/components/features/campaign/ConversationMessages";
import { TypingIndicator } from "@/components/features/campaign/TypingIndicator";

type CampaignResultsProps = {
  campaignId: string;
  initial?: Campaign;
};

const POLL_INTERVAL_MS = 3000;
const TERMINAL_STATUSES = new Set(["completed", "failed", "review"]);
const AGENTS = [
  { name: "Extractor", task: "Parsing angles, stats, and audience signals from your brief." },
  { name: "Writer", task: "Drafting platform-native copy for each channel." },
  { name: "Image", task: "Choosing visuals — AI art, stock, or text-only." },
  { name: "Reviewer", task: "Scoring output and suggesting refinements." },
];

export function CampaignResults({ campaignId, initial }: CampaignResultsProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(initial ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const data = await getCampaign(campaignId);
        if (!active) return;
        setCampaign(data);
        if (!TERMINAL_STATUSES.has(data.status)) {
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load campaign");
        }
      }
    }

    if (!initial || !TERMINAL_STATUSES.has(initial.status)) {
      poll();
    }

    return () => {
      active = false;
    };
  }, [campaignId, initial]);

  if (error) {
    return (
      <ContextCard title="Something went wrong" variant="error">
        {error}
      </ContextCard>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-1 flex-col justify-center py-16">
        <TypingIndicator label="Connecting to your campaign…" />
      </div>
    );
  }

  const copy = campaign.outputs.find((o) => o.output_type === "copy");
  const image = campaign.outputs.find((o) => o.output_type === "image");
  const review = campaign.outputs.find((o) => o.output_type === "review");
  const isProcessing = campaign.status === "running" || campaign.status === "queued";
  const activeAgentIndex = getActiveAgentIndex(campaign, copy, image, review);

  return (
    <div className="flex flex-col gap-8 pb-8">
      <header className="space-y-2">
        <StatusPill status={campaign.status} />
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold tracking-tight text-indigo-950 sm:text-3xl">
          {campaign.title}
        </h1>
      </header>

      <UserMessage>{campaign.brief}</UserMessage>

      <ContextCard title="Orchestrator">
        <AgentPipeline activeIndex={isProcessing ? activeAgentIndex : AGENTS.length} />
      </ContextCard>

      {isProcessing && (
        <AiMessage agent={AGENTS[activeAgentIndex]?.name ?? "Orchestrator"}>
          <TypingIndicator label={AGENTS[activeAgentIndex]?.task ?? "Starting pipeline…"} />
        </AiMessage>
      )}

      {campaign.error_message && (
        <ContextCard title="Pipeline error" variant="error">
          {campaign.error_message}
        </ContextCard>
      )}

      {copy?.content && (
        <AiMessage agent="Writer">
          <StreamingBlock content={copy.content} />
        </AiMessage>
      )}

      {image?.asset_url && (
        <AiMessage agent="Image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.asset_url}
            alt="Generated campaign visual"
            className="max-h-[28rem] w-full rounded-lg object-contain"
          />
        </AiMessage>
      )}

      {image?.content && !image.asset_url && (
        <AiMessage agent="Image">
          <p className="text-base leading-relaxed text-slate-700">{image.content}</p>
        </AiMessage>
      )}

      {review?.metadata && Object.keys(review.metadata).length > 0 && (
        <AiMessage agent="Reviewer">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            {JSON.stringify(review.metadata, null, 2)}
          </pre>
        </AiMessage>
      )}

      {campaign.status === "completed" && (
        <ContextCard title="Ready for review" variant="success">
          All agents finished. Review copy and visuals above, then approve or regenerate per post.
        </ContextCard>
      )}

      {!copy && !image && !review && !isProcessing && !campaign.error_message && (
        <AiMessage agent="Orchestrator">
          <TypingIndicator label="Waiting for first agent output…" />
        </AiMessage>
      )}
    </div>
  );
}

function getActiveAgentIndex(
  campaign: Campaign,
  copy: Campaign["outputs"][number] | undefined,
  image: Campaign["outputs"][number] | undefined,
  review: Campaign["outputs"][number] | undefined,
) {
  if (campaign.status === "queued") return 0;
  if (review) return 3;
  if (image) return 2;
  if (copy) return 1;
  return 0;
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-violet-100 text-violet-800",
    queued: "bg-amber-100 text-amber-800",
    running: "bg-violet-100 text-violet-700",
    review: "bg-orange-100 text-orange-800",
    completed: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium capitalize",
        styles[status] ?? styles.draft,
      )}
    >
      {status === "running" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" aria-hidden />
      )}
      {status.replace("_", " ")}
    </span>
  );
}

function AgentPipeline({ activeIndex }: { activeIndex: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
      {AGENTS.map((agent, index) => (
        <li key={agent.name} className="flex items-center gap-2">
          <span
            className={cn(
              "font-medium transition-colors duration-200",
              index < activeIndex && "text-emerald-600",
              index === activeIndex && activeIndex < AGENTS.length && "text-violet-700",
              index > activeIndex && "text-slate-400",
            )}
          >
            {agent.name}
          </span>
          {index < AGENTS.length - 1 && (
            <span className="text-slate-300" aria-hidden>
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function StreamingBlock({ content }: { content: string }) {
  return (
    <pre className="streaming-reveal whitespace-pre-wrap font-[family-name:var(--font-dm-sans)] text-base leading-relaxed text-slate-700">
      {content}
    </pre>
  );
}
