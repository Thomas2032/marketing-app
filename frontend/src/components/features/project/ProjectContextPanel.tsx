"use client";

import { useEffect, useState } from "react";
import { BrandDnaCard } from "@/components/features/project/BrandDnaCard";
import { ProjectCampaignList } from "@/components/features/project/ProjectCampaignList";
import { getProject } from "@/lib/mock-projects";
import type { BrandSource } from "@/types/project";
import { cn } from "@/lib/utils";

type ProjectContextPanelProps = {
  projectId: string;
};

export function ProjectContextPanel({ projectId }: ProjectContextPanelProps) {
  const [sources, setSources] = useState<BrandSource[]>([]);

  useEffect(() => {
    getProject(projectId).then((project) => {
      setSources(project?.brand_sources ?? []);
    });
  }, [projectId]);

  return (
    <div className="space-y-5">
      <BrandDnaCard projectId={projectId} variant="sidebar" />

      {sources.length > 0 && (
        <section className="rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Brand sources
          </h2>
          <ul className="mt-3 space-y-2">
            {sources.map((source) => (
              <li
                key={source.id}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg",
                  "border border-violet-100 bg-violet-50/50 px-3 py-2 text-sm",
                )}
              >
                <span className="font-medium capitalize text-violet-800">
                  {source.type.replace("_", " ")}
                </span>
                <span className="truncate text-slate-600">{source.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ProjectCampaignList projectId={projectId} variant="sidebar" />
    </div>
  );
}
