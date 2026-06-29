"use client";

import type { ReactNode } from "react";
import { ProjectContextPanel } from "@/components/features/project/ProjectContextPanel";
import { ProjectWorkspaceHeader } from "@/components/features/project/ProjectWorkspaceHeader";

type ProjectWorkspaceProps = {
  projectId: string;
  children: ReactNode;
  showContextPanel?: boolean;
};

export function ProjectWorkspace({
  projectId,
  children,
  showContextPanel = true,
}: ProjectWorkspaceProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ProjectWorkspaceHeader projectId={projectId} />

      {showContextPanel ? (
        <div className="grid flex-1 gap-8 xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-7">{children}</div>
          <aside className="min-w-0 xl:col-span-5">
            <div className="xl:sticky xl:top-24">
              <ProjectContextPanel projectId={projectId} />
            </div>
          </aside>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
