import Link from "next/link";
import type { PublishBatch } from "@/types/publish";
import { cn } from "@/lib/utils";

type PublishBatchStatusProps = {
  batch: PublishBatch;
  projectId: string;
  onPublishAnother: () => void;
};

export function PublishBatchStatus({ batch, projectId, onPublishAnother }: PublishBatchStatusProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 px-6 py-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Batch submitted</p>
        <h2 className="mt-2 font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-indigo-950">
          {batch.items.length} post{batch.items.length === 1 ? "" : "s"} queued
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Mock publish complete. In production this would post to your connected accounts.
        </p>
      </div>

      <ul className="space-y-2">
        {batch.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-violet-200 bg-white px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-cyan-700">{item.platform}</p>
              <p className="truncate text-sm text-slate-700">{item.text}</p>
            </div>
            <StatusPill status={item.status} />
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/projects/${projectId}`}
          className={cn(
            "inline-flex cursor-pointer items-center rounded-xl border border-violet-200 bg-white",
            "px-4 py-2.5 text-sm font-medium text-violet-800 hover:bg-violet-50",
          )}
        >
          Back to Create
        </Link>
        <button
          type="button"
          onClick={onPublishAnother}
          className={cn(
            "cursor-pointer rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white",
            "hover:bg-violet-500",
          )}
        >
          Publish another batch
        </button>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-800",
    scheduled: "bg-amber-100 text-amber-800",
    failed: "bg-red-100 text-red-800",
    draft: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        styles[status] ?? styles.draft,
      )}
    >
      {status}
    </span>
  );
}
