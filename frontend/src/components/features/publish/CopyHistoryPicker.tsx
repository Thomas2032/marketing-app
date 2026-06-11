"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ModeIcon } from "@/components/features/campaign/ModeIcon";
import type { CampaignSummary } from "@/types/campaign";
import type { CopyHistoryItem, SocialPlatform } from "@/types/publish";
import { socialPlatforms } from "@/types/publish";
import { groupCopyHistoryByCampaign } from "@/lib/copy-history";
import { getPlatformLimit } from "@/lib/platform-limits";
import { listMockCampaignSummaries } from "@/lib/mock-campaign";
import { cn } from "@/lib/utils";

type CopyHistoryPickerProps = {
  projectId: string;
  items: CopyHistoryItem[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onContinue: () => void;
};

export function CopyHistoryPicker({
  projectId,
  items,
  selectedIds,
  onSelectionChange,
  onContinue,
}: CopyHistoryPickerProps) {
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | "all">("all");

  const summaries = useMemo(() => {
    const map = new Map<string, CampaignSummary>();
    for (const summary of listMockCampaignSummaries(projectId)) {
      map.set(summary.id, summary);
    }
    return map;
  }, [items, projectId]);

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return items.filter((item) => {
      if (platformFilter !== "all" && item.platform !== platformFilter) return false;
      if (!lower) return true;
      return (
        item.campaignTitle.toLowerCase().includes(lower) ||
        item.text.toLowerCase().includes(lower) ||
        item.platform.toLowerCase().includes(lower)
      );
    });
  }, [items, query, platformFilter]);

  const groups = useMemo(() => groupCopyHistoryByCampaign(filtered), [filtered]);

  function toggleItem(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  }

  function toggleGroup(groupItems: CopyHistoryItem[]) {
    const ids = groupItems.map((item) => item.id);
    const allSelected = ids.every((id) => selectedIds.has(id));
    const next = new Set(selectedIds);
    if (allSelected) ids.forEach((id) => next.delete(id));
    else ids.forEach((id) => next.add(id));
    onSelectionChange(next);
  }

  function selectAllVisible() {
    onSelectionChange(new Set(filtered.map((item) => item.id)));
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by campaign or copy…"
            className={cn(
              "w-full rounded-xl border border-violet-200 bg-white py-2.5 pr-4 pl-10 text-sm",
              "text-indigo-950 placeholder:text-slate-400 outline-none focus:border-violet-400",
            )}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip active={platformFilter === "all"} onClick={() => setPlatformFilter("all")}>
            All
          </FilterChip>
          {socialPlatforms.map((platform) => (
            <FilterChip
              key={platform}
              active={platformFilter === platform}
              onClick={() => setPlatformFilter(platform)}
            >
              {platform}
            </FilterChip>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyHistory />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const summary = summaries.get(group.campaignId);
            const allSelected = group.items.every((item) => selectedIds.has(item.id));

            return (
              <section
                key={group.campaignId}
                className="overflow-hidden rounded-xl border border-violet-200 bg-white"
              >
                <div className="flex items-center justify-between gap-3 border-b border-violet-100 bg-violet-50/40 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                      <ModeIcon mode={summary?.task_type} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-indigo-950">
                        {group.campaignTitle}
                      </p>
                      <p className="text-xs text-slate-500">{group.items.length} posts</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.items)}
                    className="cursor-pointer text-xs font-medium text-violet-700 hover:text-violet-900"
                  >
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>
                </div>

                <ul className="divide-y divide-violet-100">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <label className="flex cursor-pointer gap-3 px-4 py-3 hover:bg-violet-50/30">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleItem(item.id)}
                          className="mt-1 accent-violet-600"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <PlatformBadge platform={item.platform} />
                            <span className="text-xs text-slate-500">
                              {item.text.length} / {getPlatformLimit(item.platform)}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-sm text-slate-700">{item.text}</p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-violet-100 pt-4">
        <button
          type="button"
          onClick={selectAllVisible}
          className="cursor-pointer text-sm text-violet-700 hover:text-violet-900"
        >
          Select all visible
        </button>
        <button
          type="button"
          disabled={selectedIds.size === 0}
          onClick={onContinue}
          className={cn(
            "cursor-pointer rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-medium text-white",
            "transition-colors duration-200 hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          Add {selectedIds.size} post{selectedIds.size === 1 ? "" : "s"} to queue →
        </button>
      </div>
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 px-6 py-12 text-center">
      <p className="text-sm font-medium text-indigo-950">No copy in this project yet</p>
      <p className="mt-2 text-sm text-slate-600">
        Run a Copywriting task first, then come back to publish.
      </p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200",
        active ? "bg-violet-600 text-white" : "bg-violet-100 text-indigo-950 hover:bg-violet-200",
      )}
    >
      {children}
    </button>
  );
}

function PlatformBadge({ platform }: { platform: SocialPlatform }) {
  return (
    <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-700">
      {platform}
    </span>
  );
}
