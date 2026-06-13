/**
 * Project data layer.
 *
 * When USE_BACKEND=true  → calls the real API
 * When USE_BACKEND=false → reads/writes sessionStorage (no backend required)
 *
 * getActiveProjectId / setActiveProjectId / getSidebarOpen / setSidebarOpen
 * are always sessionStorage — they are UI-only state, not persisted server-side.
 */
import type { Project } from "@/types/project";
import {
  apiCreateProject,
  apiDeleteProject,
  apiGetProject,
  apiListProjects,
  apiUpdateProject,
} from "@/lib/api";
import { DEMO_USER_ID, USE_BACKEND } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Internal sessionStorage helpers (mock mode)
// ---------------------------------------------------------------------------

const PROJECTS_KEY = "mock-projects";
const ACTIVE_PROJECT_KEY = "active-project-id";
const SIDEBAR_OPEN_KEY = "project-sidebar-open";

function nowIso() {
  return new Date().toISOString();
}

export function createProjectId() {
  return `project-${crypto.randomUUID()}`;
}

function _mockListProjects(): Project[] {
  if (typeof window === "undefined") return [];
  const raw = window.sessionStorage.getItem(PROJECTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

function _mockSaveProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

function _mockCreateProject(name: string, description?: string | null): Project {
  const timestamp = nowIso();
  const project: Project = {
    id: createProjectId(),
    name: name.trim(),
    description: description?.trim() || null,
    created_at: timestamp,
    updated_at: timestamp,
  };
  _mockSaveProjects([project, ..._mockListProjects()]);
  setActiveProjectId(project.id);
  return project;
}

// ---------------------------------------------------------------------------
// Public async API (used by components)
// ---------------------------------------------------------------------------

export async function listProjects(): Promise<Project[]> {
  if (USE_BACKEND) {
    return apiListProjects(DEMO_USER_ID);
  }
  return _mockListProjects();
}

export async function getProject(id: string): Promise<Project | null> {
  if (USE_BACKEND) {
    try {
      return await apiGetProject(id);
    } catch {
      return null;
    }
  }
  return _mockListProjects().find((p) => p.id === id) ?? null;
}

export async function createProject(
  name: string,
  description?: string | null,
): Promise<Project> {
  if (USE_BACKEND) {
    const project = await apiCreateProject(DEMO_USER_ID, name, description);
    setActiveProjectId(project.id);
    return project;
  }
  return _mockCreateProject(name, description);
}

export async function renameProject(id: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;

  if (USE_BACKEND) {
    await apiUpdateProject(id, { name: trimmed });
    return;
  }

  const timestamp = nowIso();
  _mockSaveProjects(
    _mockListProjects().map((p) =>
      p.id === id ? { ...p, name: trimmed, updated_at: timestamp } : p,
    ),
  );
}

export async function deleteProject(id: string): Promise<void> {
  if (USE_BACKEND) {
    await apiDeleteProject(id);
    if (getActiveProjectId() === id) setActiveProjectId(null);
    return;
  }

  const remaining = _mockListProjects().filter((p) => p.id !== id);
  _mockSaveProjects(remaining);
  if (getActiveProjectId() === id) {
    setActiveProjectId(remaining[0]?.id ?? null);
  }
}

// ---------------------------------------------------------------------------
// UI-only state — always sessionStorage
// ---------------------------------------------------------------------------

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
