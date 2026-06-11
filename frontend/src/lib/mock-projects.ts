import type { Project } from "@/types/project";

const PROJECTS_KEY = "mock-projects";
const ACTIVE_PROJECT_KEY = "active-project-id";
const SIDEBAR_OPEN_KEY = "project-sidebar-open";

function nowIso() {
  return new Date().toISOString();
}

export function createProjectId() {
  return `project-${crypto.randomUUID()}`;
}

export function listProjects(): Project[] {
  if (typeof window === "undefined") return [];

  const raw = window.sessionStorage.getItem(PROJECTS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

export function getProject(id: string): Project | null {
  return listProjects().find((project) => project.id === id) ?? null;
}

export function saveProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function createProject(name: string, description?: string | null): Project {
  const timestamp = nowIso();
  const project: Project = {
    id: createProjectId(),
    name: name.trim(),
    description: description?.trim() || null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  saveProjects([project, ...listProjects()]);
  setActiveProjectId(project.id);
  return project;
}

export function renameProject(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const timestamp = nowIso();
  saveProjects(
    listProjects().map((project) =>
      project.id === id ? { ...project, name: trimmed, updated_at: timestamp } : project,
    ),
  );
}

export function deleteProject(id: string) {
  const remaining = listProjects().filter((project) => project.id !== id);
  saveProjects(remaining);

  if (getActiveProjectId() === id) {
    setActiveProjectId(remaining[0]?.id ?? null);
  }
}

export function getActiveProjectId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(ACTIVE_PROJECT_KEY);
}

export function setActiveProjectId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) {
    window.sessionStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } else {
    window.sessionStorage.removeItem(ACTIVE_PROJECT_KEY);
  }
}

export function getSidebarOpen(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.sessionStorage.getItem(SIDEBAR_OPEN_KEY);
  return raw !== "false";
}

export function setSidebarOpen(open: boolean) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SIDEBAR_OPEN_KEY, open ? "true" : "false");
}
