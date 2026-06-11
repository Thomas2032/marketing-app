"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ModeIcon, getModeIconLabel } from "@/components/features/campaign/ModeIcon";
import type { CampaignSummary } from "@/types/campaign";
import { listMockCampaignSummaries } from "@/lib/mock-campaign";
import { cn } from "@/lib/utils";

type ProjectCampaignListProps = {
  projectId: string;
  activeCampaignId?: string;
};

export function ProjectCampaignList({ projectId, activeCampaignId }: ProjectCampaignListProps) {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);

  useEffect(() => {
    setCampaigns(listMockCampaignSummaries(projectId));
  }, [projectId, activeCampaignId]);

  if (campaigns.length === 0) return null;

  return (
    <section className="mb-8">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
        Runs in this project
      </p>
      <ul className="space-y-2">
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
