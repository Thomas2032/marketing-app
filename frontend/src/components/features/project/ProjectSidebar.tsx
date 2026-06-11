"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderKanban, MoreHorizontal, Pencil, Plus, Share2, Trash2, X } from "lucide-react";
import type { Project } from "@/types/project";
import {
  deleteProject,
  listProjects,
  renameProject,
  setActiveProjectId,
} from "@/lib/mock-projects";
import { cn } from "@/lib/utils";

type ProjectSidebarProps = {
  open: boolean;
  activeProjectId?: string;
  onClose: () => void;
};

export function ProjectSidebar({ open, activeProjectId, onClose }: ProjectSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(listProjects());
  }, [pathname, open]);

  function handleSelect(projectId: string) {
    setActiveProjectId(projectId);
    onClose();
  }

  function handleDelete(projectId: string) {
    const project = projects.find((item) => item.id === projectId);
    const confirmed = window.confirm(`Delete project "${project?.name}"?`);
    if (!confirmed) return;

    deleteProject(projectId);
    const next = listProjects();
    setProjects(next);

    if (activeProjectId === projectId) {
      router.push(next.length > 0 ? `/projects/${next[0].id}` : "/projects/new");
    }
  }

  function handleRename(projectId: string) {
    const project = projects.find((item) => item.id === projectId);
    const nextName = window.prompt("Rename project", project?.name ?? "");
    if (nextName === null) return;

    renameProject(projectId, nextName);
    setProjects(listProjects());
  }

  const panel = (
    <ProjectSidebarPanel
      projects={projects}
      activeProjectId={activeProjectId}
      onSelect={handleSelect}
      onRename={handleRename}
      onDelete={handleDelete}
      onNavigate={onClose}
    />
  );

  return (
    <>
      <aside
        className={cn(
          "hidden h-full shrink-0 flex-col overflow-hidden border-r border-violet-200 bg-white/90",
          "transition-[width,opacity] duration-300 ease-in-out lg:flex",
          open ? "w-72 opacity-100" : "w-0 border-r-0 opacity-0",
        )}
        aria-hidden={!open}
      >
        {open && panel}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close projects"
            onClick={onClose}
            className="absolute inset-0 cursor-pointer bg-indigo-950/20 backdrop-blur-sm"
          />
          <aside className="absolute top-0 left-0 flex h-dvh w-72 flex-col overflow-hidden border-r border-violet-200 bg-white shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-violet-100 px-4 py-3">
              <p className="text-sm font-semibold text-indigo-950">Projects</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="cursor-pointer rounded-lg p-1 text-slate-600 transition-colors duration-200 hover:bg-violet-50 hover:text-violet-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {panel}
          </aside>
        </div>
      )}
    </>
  );
}

type ProjectSidebarPanelProps = {
  projects: Project[];
  activeProjectId?: string;
  onSelect: (projectId: string) => void;
  onRename: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  onNavigate: () => void;
};

function ProjectSidebarPanel({
  projects,
  activeProjectId,
  onSelect,
  onRename,
  onDelete,
  onNavigate,
}: ProjectSidebarPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-violet-100 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-violet-700">Projects</p>
        <Link
          href="/projects/new"
          onClick={onNavigate}
          className={cn(
            "mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl",
            "border border-violet-200 bg-white px-4 py-2.5 text-sm font-medium text-violet-800",
            "transition-colors duration-200 hover:border-violet-300 hover:bg-violet-50",
          )}
        >
          <Plus className="h-4 w-4" aria-hidden />
          New project
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {projects.length === 0 ? (
          <p className="px-2 py-4 text-sm text-slate-600">
            No projects yet. Create one to start prompting.
          </p>
        ) : (
          <ul className="space-y-1">
            {projects.map((project) => (
              <li key={project.id}>
                <ProjectListItem
                  project={project}
                  active={project.id === activeProjectId}
                  onSelect={() => onSelect(project.id)}
                  onNavigate={onNavigate}
                  onRename={() => onRename(project.id)}
                  onDelete={() => onDelete(project.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type ProjectListItemProps = {
  project: Project;
  active: boolean;
  onSelect: () => void;
  onNavigate: () => void;
  onRename: () => void;
  onDelete: () => void;
};

function ProjectListItem({
  project,
  active,
  onSelect,
  onNavigate,
  onRename,
  onDelete,
}: ProjectListItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        "group relative rounded-xl border transition-colors duration-200",
        active
          ? "border-violet-600 bg-violet-50 ring-1 ring-violet-600/20"
          : "border-transparent hover:border-violet-200 hover:bg-violet-50/60",
      )}
    >
      <Link
        href={`/projects/${project.id}`}
        onClick={() => {
          onSelect();
          onNavigate();
        }}
        className="flex cursor-pointer items-start gap-2.5 px-3 py-3 pr-10"
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            active ? "bg-violet-200 text-violet-700" : "bg-violet-100 text-violet-600",
          )}
        >
          <FolderKanban className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "line-clamp-2 text-sm font-medium",
              active ? "text-violet-800" : "text-indigo-950",
            )}
          >
            {project.name}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatRelativeTime(project.updated_at)}
          </p>
        </div>
      </Link>

      {active && (
        <Link
          href={`/projects/${project.id}/publish`}
          onClick={onNavigate}
          className={cn(
            "mx-3 mb-3 inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-cyan-700",
            "hover:text-cyan-800",
          )}
        >
          <Share2 className="h-3 w-3" aria-hidden />
          Publish
        </Link>
      )}

      <button
        type="button"
        aria-label="Project options"
        aria-expanded={menuOpen}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setMenuOpen((value) => !value);
        }}
        className={cn(
          "absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg",
          "text-slate-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          menuOpen && "bg-violet-100 text-violet-700 opacity-100",
        )}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>

      {menuOpen && (
        <div className="absolute top-10 right-2 z-10 min-w-[9rem] rounded-xl border border-violet-200 bg-white p-1 shadow-lg">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onRename();
              setMenuOpen(false);
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-violet-50"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Rename
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onDelete();
              setMenuOpen(false);
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </button>
        </div>
      )}
    </div>
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
