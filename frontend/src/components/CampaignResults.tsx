"use client";

import { useEffect, useRef, useState } from "react";
import type { Campaign } from "@/types/campaign";
import { getCampaign, sendCampaignMessage } from "@/lib/api";
import { USE_BACKEND } from "@/lib/constants";
import {
  appendUserMessage,
  getDefaultMockCampaign,
  getMockCampaign,
  runMockFollowUpTurn,
  runMockPipeline,
  saveMockCampaign,
} from "@/lib/mock-campaign";
import { CampaignChatbox } from "@/components/features/campaign/CampaignChatbox";
import { ConversationThread } from "@/components/features/campaign/ConversationThread";
import { ContextCard } from "@/components/features/campaign/ConversationMessages";
import { cn } from "@/lib/utils";
import { TypingIndicator } from "@/components/features/campaign/TypingIndicator";
import { CampaignOutputs } from "@/components/features/campaign/results/CampaignOutputs";
import { CampaignResultsShell } from "@/components/features/campaign/results/CampaignResultsShell";

type CampaignResultsProps = {
  campaignId: string;
  initial?: Campaign;
};

const POLL_INTERVAL_MS = 3000;
const TERMINAL_STATUSES = new Set(["completed", "failed", "review"]);

export function CampaignResults({ campaignId, initial }: CampaignResultsProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(initial ?? null);
  const [error, setError] = useState<string | null>(null);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [pollingTrigger, setPollingTrigger] = useState(0);
  const stopTurnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let active = true;

    if (!USE_BACKEND) {
      const stored = getMockCampaign(campaignId);
      const base = stored ?? getDefaultMockCampaign(campaignId);
      const shouldRunTurn =
        !stored || stored.status === "running" || stored.status === "queued";

      if (stored && TERMINAL_STATUSES.has(stored.status) && !shouldRunTurn) {
        setCampaign(stored);
        return () => {
          active = false;
        };
      }

      setCampaign(null);
      stopTurnRef.current?.();
      stopTurnRef.current = runMockPipeline(base, (stage) => {
        if (active) setCampaign(stage);
      });

      return () => {
        active = false;
        stopTurnRef.current?.();
        stopTurnRef.current = null;
      };
    }

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

    if (!campaign || !TERMINAL_STATUSES.has(campaign.status)) {
      poll();
    }

    return () => {
      active = false;
    };
  }, [campaignId, initial, pollingTrigger]);

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

  async function handleFollowUpSubmit() {
    const trimmed = followUpMessage.trim();
    if (!trimmed || !campaign) return;

    if (!USE_BACKEND) {
      stopTurnRef.current?.();
      const withMessage = appendUserMessage(campaign, trimmed);
      saveMockCampaign(withMessage);
      setCampaign(withMessage);
      setFollowUpMessage("");

      stopTurnRef.current = runMockFollowUpTurn(withMessage, (stage) => {
        setCampaign(stage);
        saveMockCampaign(stage);
      });
      return;
    }

    try {
      setFollowUpMessage("");
      // Update local state immediately to show running state and message
      const updatedCampaign = {
        ...campaign,
        status: "running" as const,
        state: {
          ...campaign.state,
          messages: [
            ...(Array.isArray(campaign.state.messages) ? campaign.state.messages : []),
            {
              role: "user" as const,
              content: trimmed,
              created_at: new Date().toISOString(),
            }
          ],
          tool_calls: [],
          last_completed_tool: null,
        }
      };
      setCampaign(updatedCampaign);

      const data = await sendCampaignMessage(campaignId, trimmed);
      setCampaign(data);
      setPollingTrigger((prev) => prev + 1); // Trigger polling loop
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-1 flex-col">
      <div className="flex-1 space-y-8 pb-6">
        <CampaignResultsShell campaign={campaign}>
          <ConversationThread campaign={campaign} />
          <CampaignOutputs campaign={campaign} />
        </CampaignResultsShell>
      </div>

      <div
        className={cn(
          "sticky bottom-0 z-10 mt-auto shrink-0",
          "-mx-4 bg-gradient-to-t from-[#FAF5FF] from-60% via-[#FAF5FF] to-transparent",
          "px-4 pt-6 pb-2 sm:-mx-6 sm:px-6",
        )}
      >
        <CampaignChatbox
          value={followUpMessage}
          onChange={setFollowUpMessage}
          onSubmit={handleFollowUpSubmit}
          placeholder="Add a follow-up message…"
          inputId={`follow-up-${campaignId}`}
          inputLabel="Follow-up message"
          submitLabel="Send follow-up"
          rows={2}
        />
      </div>
    </div>
  );
}
