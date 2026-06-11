"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Sparkles } from "lucide-react";
import { CampaignChatbox } from "@/components/features/campaign/CampaignChatbox";
import { createCampaign, runCampaign } from "@/lib/api";
import { getLoadingLabel } from "@/lib/campaign-mode";
import { DEMO_USER_ID, USE_BACKEND } from "@/lib/constants";
import { createInitialMockCampaign, saveMockCampaign } from "@/lib/mock-campaign";
import type { TaskType } from "@/types/campaign";
import { taskTypes } from "@/types/campaign";
import { ContextCard } from "@/components/features/campaign/ConversationMessages";
import { TypingIndicator } from "@/components/features/campaign/TypingIndicator";
import { cn } from "@/lib/utils";

const taskPlaceholders: Record<TaskType, string> = {
  Brainstorm: "Share your product, audience, and goals — we'll explore angles and ideas…",
  Copywriting: "Describe what you want to say, the platform, and your tone…",
  "Visual Asset": "Describe the visual you need — style, subject, and where it'll be used…",
};

const defaultPlaceholder = "Describe your campaign in detail";

type CampaignFormProps = {
  projectId: string;
};

export function CampaignForm({ projectId }: CampaignFormProps) {
  const router = useRouter();
  const [brief, setBrief] = useState("");
  const [showRefine, setShowRefine] = useState(false);
  const [title, setTitle] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskType, setTaskType] = useState<TaskType | null>(null);

  const hasBrief = brief.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const resolvedTitle =
      title.trim() || brief.trim().split(/[.!?\n]/)[0]?.slice(0, 80) || "Untitled campaign";

    if (!USE_BACKEND) {
      const mockCampaign = createInitialMockCampaign({
        projectId,
        title: resolvedTitle,
        brief,
        brandVoice: brandVoice.trim() || undefined,
        targetAudience: targetAudience.trim() || undefined,
        taskType,
      });
      saveMockCampaign(mockCampaign);

      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      setLoading(false);
      router.push(`/campaigns/${mockCampaign.id}`);
      return;
    }

    try {
      const campaign = await createCampaign({
        user_id: DEMO_USER_ID,
        title: resolvedTitle,
        brief,
        brand_voice: brandVoice.trim() || "professional",
        target_audience: targetAudience.trim() || undefined,
      });
      await runCampaign(campaign.id);
      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="campaign-form" onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <div className="mb-8">
        <p className="mb-3 flex items-center gap-2 text-sm text-slate-600">
          <Sparkles className="h-4 w-4 text-violet-600" aria-hidden />
          What should we create today?
        </p>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight text-indigo-950 sm:text-4xl">
          Describe your campaign
        </h1>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin-bottom] duration-300 ease-in-out",
          taskType ? "mb-0 grid-rows-[0fr] opacity-0" : "mb-5 grid-rows-[1fr] opacity-100",
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "flex flex-wrap gap-2 transition-transform duration-300 ease-in-out",
              taskType ? "-translate-y-1" : "translate-y-0",
            )}
          >
            {taskTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTaskType(type)}
                tabIndex={taskType ? -1 : 0}
                className={cn(
                  "cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600",
                  "transition-colors duration-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30",
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CampaignChatbox
        value={brief}
        onChange={setBrief}
        onSubmit={() => {
          const form = document.getElementById("campaign-form") as HTMLFormElement | null;
          form?.requestSubmit();
        }}
        disabled={loading || !projectId}
        inputId="brief"
        inputLabel="Campaign brief"
        submitLabel="Generate campaign"
        taskType={taskType}
        onClearTaskType={() => setTaskType(null)}
        placeholder={taskType ? taskPlaceholders[taskType] : defaultPlaceholder}
      />

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowRefine((open) => !open)}
          aria-expanded={showRefine}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-500",
            "transition-colors duration-200 hover:text-violet-700",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 focus-visible:rounded-lg",
          )}
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", showRefine && "rotate-180")}
            aria-hidden
          />
          Refine context
        </button>

        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            showRefine ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <ContextCard title="Optional context" variant="default">
              <div className="mt-1 space-y-4">
                <RefineField
                  id="title"
                  label="Title"
                  value={title}
                  onChange={setTitle}
                  placeholder="Auto-generated from your brief if left blank"
                />
                <RefineField
                  id="brandVoice"
                  label="Brand voice"
                  value={brandVoice}
                  onChange={setBrandVoice}
                  placeholder="professional, playful, bold…"
                />
                <RefineField
                  id="audience"
                  label="Target audience"
                  value={targetAudience}
                  onChange={setTargetAudience}
                  placeholder="Growth marketers, parents, developers…"
                />
              </div>
            </ContextCard>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6">
          <ContextCard title="Could not start campaign" variant="error">
            {error}
          </ContextCard>
        </div>
      )}

      {loading && (
        <div className="mt-8">
          <AiMessageStub agent="Orchestrator">
            <TypingIndicator label={getLoadingLabel(taskType)} />
          </AiMessageStub>
        </div>
      )}

    </form>
  );
}

type AiMessageStubProps = {
  agent: string;
  children: React.ReactNode;
};

function AiMessageStub({ agent, children }: AiMessageStubProps) {
  return (
    <article className="flex flex-col gap-2">
      <p className="text-xs font-medium text-violet-700">{agent}</p>
      <div className="rounded-2xl rounded-bl-md border border-violet-200/80 border-l-4 border-l-violet-600 bg-white px-4 py-3 shadow-sm">
        {children}
      </div>
    </article>
  );
}

type RefineFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

function RefineField({ id, label, value, onChange, placeholder }: RefineFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500"
      >
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full bg-transparent py-1.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none",
          "border-b border-violet-200 transition-colors duration-200 focus:border-violet-400",
        )}
      />
    </div>
  );
}
