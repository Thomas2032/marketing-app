"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, Share2 } from "lucide-react";
import { ProjectSubNav } from "@/components/features/project/ProjectSubNav";
import { getProject } from "@/lib/mock-projects";
import { cn } from "@/lib/utils";

type ProjectWorkspaceHeaderProps = {
  projectId: string;
};

export function ProjectWorkspaceHeader({ projectId }: ProjectWorkspaceHeaderProps) {
  const pathname = usePathname();
  const [name, setName] = useState("Project");
  const isPublish = pathname.endsWith("/publish");

  useEffect(() => {
    getProject(projectId).then((project) => {
      if (project) setName(project.name);
    });
  }, [projectId]);

  return (
    <header className="mb-8 border-b border-violet-100 pb-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <FolderKanban className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-violet-700">Project</p>
              <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold tracking-tight text-indigo-950 sm:text-3xl">
                {name}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          {!isPublish && (
            <Link
              href={`/projects/${projectId}/publish`}
              className={cn(
                "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5",
                "text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-600",
              )}
            >
              <Share2 className="h-4 w-4" aria-hidden />
              Publish to social
            </Link>
          )}
          <ProjectSubNav projectId={projectId} className="mb-0 border-b-0" />
        </div>
      </div>
    </header>
  );
}
