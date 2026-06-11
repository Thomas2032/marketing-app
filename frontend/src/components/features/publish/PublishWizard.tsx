"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PublishBatch, PublishQueueItem, SocialPlatform } from "@/types/publish";
import { listProjectCopyHistory } from "@/lib/copy-history";
import {
  addToPublishQueue,
  getMockConnectedPlatforms,
  getPublishQueue,
  savePublishQueue,
  submitPublishBatch,
} from "@/lib/mock-publish";
import { CopyHistoryPicker } from "@/components/features/publish/CopyHistoryPicker";
import { PublishBatchStatus } from "@/components/features/publish/PublishBatchStatus";
import { PublishConfirm } from "@/components/features/publish/PublishConfirm";
import { PublishQueueEditor } from "@/components/features/publish/PublishQueueEditor";
import { TypingIndicator } from "@/components/features/campaign/TypingIndicator";
import { cn } from "@/lib/utils";

type WizardStep = 1 | 2 | 3 | "success";

type PublishWizardProps = {
  projectId: string;
};

export function PublishWizard({ projectId }: PublishWizardProps) {
  const searchParams = useSearchParams();
  const preselectCampaignId = searchParams.get("campaignId");

  const [step, setStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState(() => listProjectCopyHistory(projectId));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [queue, setQueue] = useState<PublishQueueItem[]>([]);
  const [batch, setBatch] = useState<PublishBatch | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<SocialPlatform[]>([]);

  useEffect(() => {
    setLoading(true);
    const items = listProjectCopyHistory(projectId);
    setHistory(items);

    const existingQueue = getPublishQueue(projectId);
    if (existingQueue.length > 0) {
      setQueue(existingQueue);
      setStep(2);
    }

    if (preselectCampaignId) {
      const ids = items
        .filter((item) => item.campaignId === preselectCampaignId)
        .map((item) => item.id);
      setSelectedIds(new Set(ids));
    }

    setConnectedPlatforms(getMockConnectedPlatforms() as SocialPlatform[]);
    setLoading(false);
  }, [projectId, preselectCampaignId]);

  const stepLabels = useMemo(
    () => ({
      1: "Pick posts",
      2: "Review",
      3: "Schedule",
    }),
    [],
  );

  function handleAddToQueue() {
    const selected = history.filter((item) => selectedIds.has(item.id));
    const next = addToPublishQueue(projectId, selected);
    setQueue(next);
    setStep(2);
  }

  function handleQueueChange(items: PublishQueueItem[]) {
    setQueue(items);
    savePublishQueue(projectId, items);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const result = await submitPublishBatch(projectId, queue);
      setBatch(result);
      setStep("success");
      setQueue([]);
    } finally {
      setSubmitting(false);
    }
  }

  function resetWizard() {
    setStep(1);
    setBatch(null);
    setSelectedIds(new Set());
    setHistory(listProjectCopyHistory(projectId));
  }

  if (loading) {
    return (
      <div className="py-16">
        <TypingIndicator label="Loading copy from project history…" />
      </div>
    );
  }

  if (step === "success" && batch) {
    return (
      <PublishBatchStatus
        batch={batch}
        projectId={projectId}
        onPublishAnother={resetWizard}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-indigo-950">
          Publish to social
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pick copy from past runs, review, and batch publish or schedule.
        </p>
      </header>

      <WizardStepper current={step} labels={stepLabels} />

      {history.length === 0 && step === 1 ? (
        <EmptyPublishState projectId={projectId} />
      ) : (
        <>
          {step === 1 && (
            <CopyHistoryPicker
              projectId={projectId}
              items={history}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onContinue={handleAddToQueue}
            />
          )}
          {step === 2 && (
            <PublishQueueEditor
              items={queue}
              connectedPlatforms={connectedPlatforms}
              onConnectedChange={setConnectedPlatforms}
              onChange={handleQueueChange}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <PublishConfirm
              items={queue}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
        </>
      )}
    </div>
  );
}

function WizardStepper({
  current,
  labels,
}: {
  current: WizardStep;
  labels: Record<1 | 2 | 3, string>;
}) {
  const steps: Array<1 | 2 | 3> = [1, 2, 3];

  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, index) => {
        const active = current === step;
        const done = typeof current === "number" && current > step;

        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                done && "bg-emerald-100 text-emerald-800",
                active && "bg-violet-600 text-white",
                !done && !active && "bg-violet-100 text-violet-600",
              )}
            >
              {step}
            </span>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                active ? "font-medium text-indigo-950" : "text-slate-500",
              )}
            >
              {labels[step]}
            </span>
            {index < steps.length - 1 && (
              <span className="mx-1 hidden h-px w-6 bg-violet-200 sm:block" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function EmptyPublishState({ projectId }: { projectId: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 px-6 py-12 text-center">
      <p className="text-sm font-medium text-indigo-950">No copy available to publish</p>
      <p className="mt-2 text-sm text-slate-600">
        Run a Copywriting task in this project, then return here to batch publish.
      </p>
      <Link
        href={`/projects/${projectId}`}
        className={cn(
          "mt-6 inline-flex cursor-pointer rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white",
          "hover:bg-violet-500",
        )}
      >
        Go to Create
      </Link>
    </div>
  );
}
