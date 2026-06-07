"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Sparkles } from "lucide-react";
import { createCampaign, runCampaign } from "@/lib/api";
import { DEMO_USER_ID } from "@/lib/constants";
import { ContextCard } from "@/components/features/campaign/ConversationMessages";
import { TypingIndicator } from "@/components/features/campaign/TypingIndicator";
import { cn } from "@/lib/utils";

const suggestions = [
  "Summer product launch for a SaaS tool",
  "LinkedIn thought leadership series",
  "Re-engagement campaign for churned users",
];

export function CampaignForm() {
  const router = useRouter();
  const [brief, setBrief] = useState("");
  const [showRefine, setShowRefine] = useState(false);
  const [title, setTitle] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasBrief = brief.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const resolvedTitle =
      title.trim() || brief.trim().split(/[.!?\n]/)[0]?.slice(0, 80) || "Untitled campaign";

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
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <div className="mb-8">
        <p className="mb-3 flex items-center gap-2 text-sm text-slate-600">
          <Sparkles className="h-4 w-4 text-violet-600" aria-hidden />
          What should we create today?
        </p>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight text-indigo-950 sm:text-4xl">
          Describe your campaign
        </h1>
      </div>

      <ContextCard title="Your brief">
        <label htmlFor="brief" className="sr-only">
          Campaign brief
        </label>
        <textarea
          id="brief"
          required
          rows={6}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Paste a URL, drop your idea, or tell me about the product, audience, and goal…"
          className={cn(
            "mt-1 w-full resize-none bg-transparent text-base leading-relaxed text-slate-800",
            "placeholder:text-slate-400 outline-none",
          )}
        />
      </ContextCard>

      {!hasBrief && (
        <div className="mt-5 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setBrief(suggestion)}
              className={cn(
                "cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2",
                "text-sm text-slate-600 transition-colors duration-200",
                "hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30",
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

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
          <AiMessageStub>
            <TypingIndicator label="Starting extractor, writer, image, and reviewer agents…" />
          </AiMessageStub>
        </div>
      )}

      <div
        className={cn(
          "sticky bottom-0 mt-auto bg-gradient-to-t from-[#FAF5FF] via-[#FAF5FF] to-transparent pt-6 pb-2",
          hasBrief && !loading ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <button
          type="submit"
          disabled={loading || !hasBrief}
          className={cn(
            "w-full cursor-pointer rounded-2xl bg-cyan-500 px-6 py-4 text-base font-medium text-white",
            "transition-colors duration-200 hover:bg-cyan-600",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-2",
          )}
        >
          Generate campaign
        </button>
      </div>
    </form>
  );
}

function AiMessageStub({ children }: { children: React.ReactNode }) {
  return (
    <article className="flex flex-col gap-2">
      <p className="text-xs font-medium text-violet-700">Orchestrator</p>
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
