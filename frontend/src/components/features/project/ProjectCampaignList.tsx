"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { ModeIcon, getModeIconLabel } from "@/components/features/campaign/ModeIcon";
import type { CampaignSummary } from "@/types/campaign";
import { listMockCampaignSummaries } from "@/lib/mock-campaign";
import { cn } from "@/lib/utils";

type ProjectCampaignListProps = {
  projectId: string;
  activeCampaignId?: string;
  variant?: "default" | "sidebar";
};

export function ProjectCampaignList({
  projectId,
  activeCampaignId,
  variant = "default",
}: ProjectCampaignListProps) {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);

  useEffect(() => {
    setCampaigns(listMockCampaignSummaries(projectId));
  }, [projectId, activeCampaignId]);

  if (campaigns.length === 0) return null;

  const isSidebar = variant === "sidebar";

  return (
    <section
      className={cn(
        isSidebar
          ? "rounded-2xl border border-violet-200 bg-white p-4 shadow-sm"
          : "mb-8",
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <History className="h-4 w-4 text-violet-600" aria-hidden />
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Past runs
        </h2>
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
          {campaigns.length}
        </span>
      </div>

      <ul className={cn("space-y-2", isSidebar && "max-h-64 overflow-y-auto pr-1")}>
        {campaigns.map((campaign) => (
          <li key={campaign.id}>
            <Link
              href={`/campaigns/${campaign.id}`}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200",
                campaign.id === activeCampaignId
                  ? "border-violet-600 bg-violet-50"
                  : "border-violet-100 bg-white hover:border-violet-200 hover:bg-violet-50/50",
              )}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600"
                title={getModeIconLabel(campaign.task_type)}
              >
                <ModeIcon mode={campaign.task_type} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-indigo-950">{campaign.title}</p>
                <p className="text-xs capitalize text-slate-500">{campaign.status}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
