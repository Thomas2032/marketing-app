import type { PublishQueueItem } from "@/types/publish";
import { cn } from "@/lib/utils";

type PublishConfirmProps = {
  items: PublishQueueItem[];
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
};

export function PublishConfirm({ items, onBack, onSubmit, submitting }: PublishConfirmProps) {
  const publishNowCount = items.filter((item) => !item.scheduledAt).length;
  const scheduledCount = items.filter((item) => item.scheduledAt).length;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-violet-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-indigo-950">Review your batch</h2>
        <p className="mt-1 text-sm text-slate-600">
          {items.length} post{items.length === 1 ? "" : "s"} ready — {publishNowCount} now,{" "}
          {scheduledCount} scheduled.
        </p>

        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-violet-100 bg-violet-50/30 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-cyan-700">{item.platform}</p>
                <p className="line-clamp-1 text-sm text-slate-700">{item.text}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-500">
                {item.scheduledAt ? formatSchedule(item.scheduledAt) : "Now"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-violet-100 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="cursor-pointer text-sm text-slate-600 hover:text-violet-700 disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || items.length === 0}
          className={cn(
            "cursor-pointer rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-medium text-white",
            "transition-colors duration-200 hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {submitting ? "Publishing…" : "Publish batch"}
        </button>
      </div>
    </div>
  );
}

function formatSchedule(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
