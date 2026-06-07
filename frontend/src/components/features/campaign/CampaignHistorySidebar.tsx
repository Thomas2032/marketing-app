"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Plus, X } from "lucide-react";
import type { CampaignStatus, CampaignSummary } from "@/types/campaign";
import { listCampaigns } from "@/lib/api";
import { DEMO_USER_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CampaignHistorySidebarProps = {
  activeCampaignId?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function CampaignHistorySidebar({
  activeCampaignId,
  mobileOpen = false,
  onMobileClose,
}: CampaignHistorySidebarProps) {
  const pathname = usePathname();
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await listCampaigns(DEMO_USER_ID);
        if (active) setCampaigns(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load history");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [pathname]);

  const content = (
    <SidebarContent
      campaigns={campaigns}
      loading={loading}
      error={error}
      activeCampaignId={activeCampaignId}
      onNavigate={onMobileClose}
    />
  );

  return (
    <>
      <aside
        className={cn(
          "hidden h-full w-72 shrink-0 flex-col overflow-hidden border-r border-violet-200 bg-white/80 lg:flex",
        )}
      >
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close history"
            onClick={onMobileClose}
            className="absolute inset-0 cursor-pointer bg-indigo-950/20 backdrop-blur-sm"
          />
          <aside className="absolute top-0 left-0 flex h-dvh w-72 flex-col overflow-hidden border-r border-violet-200 bg-white shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-violet-100 px-4 py-3">
              <p className="text-sm font-semibold text-indigo-950">Campaign history</p>
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close"
                className="cursor-pointer rounded-lg p-1 text-slate-600 transition-colors duration-200 hover:bg-violet-50 hover:text-violet-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

type CampaignHistoryToggleProps = {
  onOpen: () => void;
};

export function CampaignHistoryToggle({ onOpen }: CampaignHistoryToggleProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5",
        "text-sm text-slate-600 transition-colors duration-200 hover:border-violet-300 hover:text-violet-700 lg:hidden",
      )}
    >
      <History className="h-4 w-4" aria-hidden />
      History
    </button>
  );
}

type SidebarContentProps = {
  campaigns: CampaignSummary[];
  loading: boolean;
  error: string | null;
  activeCampaignId?: string;
  onNavigate?: () => void;
};

function SidebarContent({
  campaigns,
  loading,
  error,
  activeCampaignId,
  onNavigate,
}: SidebarContentProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-violet-100 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-violet-700">History</p>
        <Link
          href="/campaigns/new"
          onClick={onNavigate}
          className={cn(
            "mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl",
            "bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-600",
          )}
        >
          <Plus className="h-4 w-4" aria-hidden />
          New campaign
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {loading && (
          <p className="px-2 py-4 text-sm text-slate-600">Loading campaigns…</p>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && campaigns.length === 0 && (
          <p className="px-2 py-4 text-sm text-slate-600">
            No campaigns yet. Create your first one above.
          </p>
        )}

        <ul className="space-y-1">
          {campaigns.map((campaign) => (
            <li key={campaign.id}>
              <HistoryItem
                campaign={campaign}
                active={campaign.id === activeCampaignId}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type HistoryItemProps = {
  campaign: CampaignSummary;
  active: boolean;
  onNavigate?: () => void;
};

function HistoryItem({ campaign, active, onNavigate }: HistoryItemProps) {
  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      onClick={onNavigate}
      className={cn(
        "block cursor-pointer rounded-xl border px-3 py-3 transition-colors duration-200",
        active
          ? "border-violet-600 bg-violet-50 ring-1 ring-violet-600/20"
          : "border-transparent hover:border-violet-200 hover:bg-violet-50/60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "line-clamp-2 text-sm font-medium",
            active ? "text-violet-800" : "text-indigo-950",
          )}
        >
          {campaign.title}
        </p>
        <StatusDot status={campaign.status} />
      </div>
      <p className="mt-1.5 text-xs text-slate-600">{formatRelativeTime(campaign.updated_at)}</p>
    </Link>
  );
}

function StatusDot({ status }: { status: CampaignStatus }) {
  const colors: Record<CampaignStatus, string> = {
    draft: "bg-violet-300",
    queued: "bg-amber-400",
    running: "bg-violet-500 animate-pulse",
    review: "bg-orange-400",
    completed: "bg-emerald-500",
    failed: "bg-red-500",
  };

  return (
    <span
      className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", colors[status])}
      title={status}
      aria-label={status}
    />
  );
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
