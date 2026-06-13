"use client";

import type { PublishQueueItem, SocialPlatform } from "@/types/publish";
import { getPlatformLimit, isOverPlatformLimit } from "@/lib/platform-limits";
import { ConnectedAccountsStrip } from "@/components/features/publish/ConnectedAccountsStrip";
import { setMockConnectedPlatforms } from "@/lib/mock-publish";
import { cn } from "@/lib/utils";

type PublishQueueEditorProps = {
  items: PublishQueueItem[];
  connectedPlatforms: SocialPlatform[];
  onConnectedChange: (platforms: SocialPlatform[]) => void;
  onChange: (items: PublishQueueItem[]) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function PublishQueueEditor({
  items,
  connectedPlatforms,
  onConnectedChange,
  onChange,
  onBack,
  onContinue,
}: PublishQueueEditorProps) {
  const hasOverLimit = items.some((item) => isOverPlatformLimit(item.platform, item.text));
  const hasDisconnected = items.some((item) => !connectedPlatforms.includes(item.platform));

  function updateItem(id: string, patch: Partial<PublishQueueItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function applySameTimeToAll(value: string) {
    onChange(
      items.map((item) => ({
        ...item,
        scheduledAt: value ? new Date(value).toISOString() : null,
      })),
    );
  }

  function publishAllNow() {
    onChange(items.map((item) => ({ ...item, scheduledAt: null })));
  }

  return (
    <div className="space-y-5">
      <ConnectedAccountsStrip
        connected={connectedPlatforms}
        onChange={(platforms) => {
          onConnectedChange(platforms);
          setMockConnectedPlatforms(platforms, connectedPlatforms);
        }}
      />

      {hasDisconnected && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Some posts target platforms that are not connected. You can still preview the batch in mock
          mode.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-slate-600">
          Apply time to all
          <input
            type="datetime-local"
            onChange={(event) => applySameTimeToAll(event.target.value)}
            className="ml-2 rounded-lg border border-violet-200 px-2 py-1 text-xs"
          />
        </label>
        <button
          type="button"
          onClick={publishAllNow}
          className="cursor-pointer text-xs font-medium text-violet-700 hover:text-violet-900"
        >
          Publish all now
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const overLimit = isOverPlatformLimit(item.platform, item.text);
          const disconnected = !connectedPlatforms.includes(item.platform);

          return (
            <article
              key={item.id}
              className={cn(
                "rounded-xl border bg-white p-4",
                overLimit ? "border-red-300" : "border-violet-200",
              )}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-700">
                    {item.platform}
                  </span>
                  {disconnected && (
                    <span className="text-[10px] text-amber-700">Not connected</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="cursor-pointer text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              <textarea
                value={item.text}
                onChange={(event) => updateItem(item.id, { text: event.target.value })}
                rows={3}
                className={cn(
                  "w-full resize-none rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-700",
                  "outline-none focus:border-violet-400",
                )}
              />
              <p className={cn("mt-1 text-xs", overLimit ? "text-red-600" : "text-slate-500")}>
                {item.text.length} / {getPlatformLimit(item.platform)} characters
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {item.imageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-14 w-14 rounded-lg border border-violet-200 object-cover"
                  />
                )}
                <label className="text-xs text-slate-600">
                  Schedule
                  <input
                    type="datetime-local"
                    value={item.scheduledAt ? toLocalInputValue(item.scheduledAt) : ""}
                    onChange={(event) =>
                      updateItem(item.id, {
                        scheduledAt: event.target.value
                          ? new Date(event.target.value).toISOString()
                          : null,
                      })
                    }
                    className="ml-2 rounded-lg border border-violet-200 px-2 py-1 text-xs"
                  />
                </label>
                {!item.scheduledAt && (
                  <span className="text-xs text-emerald-700">Publish now</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-violet-100 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer text-sm text-slate-600 hover:text-violet-700"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={items.length === 0 || hasOverLimit}
          onClick={onContinue}
          className={cn(
            "cursor-pointer rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white",
            "hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          Review batch →
        </button>
      </div>
    </div>
  );
}

function toLocalInputValue(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}
