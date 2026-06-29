/**
 * Project data layer.
 *
 * When USE_BACKEND=true  → calls the real API
 * When USE_BACKEND=false → reads/writes sessionStorage (no backend required)
 *
 * Brand sources + Brand DNA are always stored in sessionStorage (UI-only overlay).
 *
 * getActiveProjectId / setActiveProjectId / getSidebarOpen / setSidebarOpen
 * are always sessionStorage — they are UI-only state, not persisted server-side.
 */
import type { BrandSource, Project } from "@/types/project";
import {
  apiCreateProject,
  apiDeleteProject,
  apiGetProject,
  apiListProjects,
  apiUpdateProject,
} from "@/lib/api";
import { generateMockBrandDna } from "@/lib/mock-brand-dna";
import { DEMO_USER_ID, USE_BACKEND } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Internal sessionStorage helpers (mock mode)
// ---------------------------------------------------------------------------

const PROJECTS_KEY = "mock-projects";
const BRAND_CONTEXT_KEY = "mock-project-brand-context";
const ACTIVE_PROJECT_KEY = "active-project-id";
const SIDEBAR_OPEN_KEY = "project-sidebar-open";

type BrandContextEntry = {
  brand_sources: BrandSource[];
  brand_dna: ReturnType<typeof generateMockBrandDna>;
};

type BrandContextMap = Record<string, BrandContextEntry>;

function nowIso() {
  return new Date().toISOString();
}

export function createProjectId() {
  return `project-${crypto.randomUUID()}`;
}

function _readBrandContext(): BrandContextMap {
  if (typeof window === "undefined") return {};
  const raw = window.sessionStorage.getItem(BRAND_CONTEXT_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as BrandContextMap;
  } catch {
    return {};
  }
}

function _writeBrandContext(map: BrandContextMap) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(BRAND_CONTEXT_KEY, JSON.stringify(map));
}

function _saveBrandContext(projectId: string, sources: BrandSource[]) {
  const dna = generateMockBrandDna(sources);
  const map = _readBrandContext();
  map[projectId] = { brand_sources: sources, brand_dna: dna };
  _writeBrandContext(map);
}

function _deleteBrandContext(projectId: string) {
  const map = _readBrandContext();
  delete map[projectId];
  _writeBrandContext(map);
}

function _mergeBrandContext(project: Project): Project {
  const entry = _readBrandContext()[project.id];
  if (!entry) return project;
  return {
    ...project,
    brand_sources: entry.brand_sources,
    brand_dna: entry.brand_dna,
  };
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

function _mockCreateProject(name: string, brandSources: BrandSource[]): Project {
  const timestamp = nowIso();
  const brandDna = generateMockBrandDna(brandSources);
  const project: Project = {
    id: createProjectId(),
    name: name.trim(),
    description: null,
    brand_sources: brandSources,
    brand_dna: brandDna,
    created_at: timestamp,
    updated_at: timestamp,
  };
  _mockSaveProjects([project, ..._mockListProjects()]);
  _saveBrandContext(project.id, brandSources);
  setActiveProjectId(project.id);
  return project;
}

// ---------------------------------------------------------------------------
// Public async API (used by components)
// ---------------------------------------------------------------------------

export async function listProjects(): Promise<Project[]> {
  if (USE_BACKEND) {
    const projects = await apiListProjects(DEMO_USER_ID);
    return projects.map(_mergeBrandContext);
  }
  return _mockListProjects();
}

export async function getProject(id: string): Promise<Project | null> {
  if (USE_BACKEND) {
    try {
      const project = await apiGetProject(id);
      return _mergeBrandContext(project);
    } catch {
      return null;
    }
  }
  const project = _mockListProjects().find((p) => p.id === id) ?? null;
  return project ? _mergeBrandContext(project) : null;
}

export async function createProject(
  name: string,
  brandSources: BrandSource[],
): Promise<Project> {
  if (USE_BACKEND) {
    const project = await apiCreateProject(DEMO_USER_ID, name, null);
    _saveBrandContext(project.id, brandSources);
    setActiveProjectId(project.id);
    return _mergeBrandContext({ ...project, description: null });
  }
  return _mockCreateProject(name, brandSources);
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
    _deleteBrandContext(id);
    if (getActiveProjectId() === id) setActiveProjectId(null);
    return;
  }

  const remaining = _mockListProjects().filter((p) => p.id !== id);
  _mockSaveProjects(remaining);
  _deleteBrandContext(id);
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
