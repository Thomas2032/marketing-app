"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CampaignHistorySidebar,
  CampaignHistoryToggle,
} from "@/components/features/campaign/CampaignHistorySidebar";
import { cn } from "@/lib/utils";

type CampaignShellProps = {
  children: React.ReactNode;
  activeCampaignId?: string;
  backHref?: string;
  backLabel?: string;
};

export function CampaignShell({
  children,
  activeCampaignId,
  backHref = "/",
  backLabel = "← Home",
}: CampaignShellProps) {
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#FAF5FF]">
      <CampaignHistorySidebar
        activeCampaignId={activeCampaignId}
        mobileOpen={mobileHistoryOpen}
        onMobileClose={() => setMobileHistoryOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-40 border-b border-violet-100 bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">
                  M
                </span>
                <span className="text-sm font-semibold text-indigo-950">Marketing App</span>
              </Link>
              <CampaignHistoryToggle onOpen={() => setMobileHistoryOpen(true)} />
            </div>
            <Link
              href={backHref}
              className={cn(
                "cursor-pointer text-sm text-slate-600 transition-colors duration-200 hover:text-violet-700",
              )}
            >
              {backLabel}
            </Link>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
