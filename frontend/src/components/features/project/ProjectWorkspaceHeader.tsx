"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, Share2 } from "lucide-react";
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
    const project = getProject(projectId);
    if (project) setName(project.name);
  }, [projectId]);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <FolderKanban className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-violet-700">Project</p>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-indigo-950">
            {name}
          </h1>
        </div>
      </div>

      {!isPublish && (
        <Link
          href={`/projects/${projectId}/publish`}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5",
            "text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-600",
          )}
        >
          <Share2 className="h-4 w-4" aria-hidden />
          Publish to social
        </Link>
      )}
    </div>
  );
}
