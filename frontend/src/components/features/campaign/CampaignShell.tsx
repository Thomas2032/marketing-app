"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PanelLeft } from "lucide-react";
import { ProjectSidebar } from "@/components/features/project/ProjectSidebar";
import { getMockCampaign } from "@/lib/mock-campaign";
import { getSidebarOpen, setActiveProjectId, setSidebarOpen } from "@/lib/mock-projects";
import { USE_BACKEND } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CampaignShellProps = {
  children: React.ReactNode;
  activeProjectId?: string;
  activeCampaignId?: string;
  backHref?: string;
  backLabel?: string;
  contentWidth?: "narrow" | "wide";
};

export function CampaignShell({
  children,
  activeProjectId,
  activeCampaignId,
  backHref = "/",
  backLabel = "← Home",
  contentWidth = "narrow",
}: CampaignShellProps) {
  const [sidebarOpen, setSidebarOpenState] = useState(false);
  const [resolvedProjectId, setResolvedProjectId] = useState<string | undefined>(
    activeProjectId,
  );

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    setSidebarOpenState(desktop ? getSidebarOpen() : false);
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      setResolvedProjectId(activeProjectId);
      setActiveProjectId(activeProjectId);
      return;
    }

    if (!activeCampaignId || USE_BACKEND) return;

    const campaign = getMockCampaign(activeCampaignId);
    if (campaign?.project_id) {
      setResolvedProjectId(campaign.project_id);
      setActiveProjectId(campaign.project_id);
    }
  }, [activeProjectId, activeCampaignId]);

  function toggleSidebar() {
    setSidebarOpenState((open) => {
      const next = !open;
      setSidebarOpen(next);
      return next;
    });
  }

  function closeSidebar() {
    setSidebarOpenState(false);
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[#FAF5FF]">
      <ProjectSidebar
        open={sidebarOpen}
        activeProjectId={resolvedProjectId}
        onClose={closeSidebar}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-40 border-b border-violet-100 bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label={sidebarOpen ? "Hide projects sidebar" : "Show projects sidebar"}
                aria-expanded={sidebarOpen}
                className={cn(
                  "inline-flex cursor-pointer items-center justify-center rounded-lg border border-violet-200",
                  "bg-white p-2 text-slate-600 transition-colors duration-200",
                  "hover:border-violet-300 hover:text-violet-700",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30",
                )}
              >
                <PanelLeft className="h-4 w-4" aria-hidden />
              </button>
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">
                  M
                </span>
                <span className="hidden text-sm font-semibold text-indigo-950 sm:inline">
                  Marketing App
                </span>
              </Link>
            </div>
            <Link
              href={resolvedProjectId ? `/projects/${resolvedProjectId}` : backHref}
              className={cn(
                "cursor-pointer text-sm text-slate-600 transition-colors duration-200 hover:text-violet-700",
              )}
            >
              {resolvedProjectId ? "← Project" : backLabel}
            </Link>
          </div>
        </header>

        <main
          className={cn(
            "mx-auto flex min-h-0 w-full flex-1 flex-col px-4 py-8 pb-4 sm:px-6 sm:py-10 sm:pb-4",
            contentWidth === "wide" ? "max-w-7xl" : "max-w-3xl",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
