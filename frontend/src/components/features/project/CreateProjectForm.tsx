"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import { BrandSourcesField } from "@/components/features/project/BrandSourcesField";
import { USE_BACKEND } from "@/lib/constants";
import { createProject } from "@/lib/mock-projects";
import type { BrandSource } from "@/types/project";
import { ContextCard } from "@/components/features/campaign/ConversationMessages";
import { TypingIndicator } from "@/components/features/campaign/TypingIndicator";
import { cn } from "@/lib/utils";

const EXTRACT_DELAY_MS = 1200;

export function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [brandSources, setBrandSources] = useState<BrandSource[]>([]);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Project name is required.");
      return;
    }

    if (brandSources.length === 0) {
      setSourceError("Add at least one brand source (website, brand page, or document).");
      return;
    }

    setLoading(true);
    setError(null);
    setSourceError(null);
    setExtracting(true);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, EXTRACT_DELAY_MS));
      const project = await createProject(trimmed, brandSources);
      router.push(`/projects/${project.id}`);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Unknown error";
      if (USE_BACKEND) {
        setError(
          `Could not reach the API (${detail}). Start the backend on port 8000, or set NEXT_PUBLIC_USE_BACKEND=false in frontend/.env.local for mock mode.`,
        );
      } else {
        setError("Failed to create project. Please try again.");
      }
    } finally {
      setLoading(false);
      setExtracting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl">
      <div className="mb-8">
        <p className="mb-3 flex items-center gap-2 text-sm text-slate-600">
          <FolderPlus className="h-4 w-4 text-violet-600" aria-hidden />
          Start with a project
        </p>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight text-indigo-950 sm:text-4xl">
          Create your first project
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          Projects organize campaigns around a single brand. Add your website, product pages, or
          brand guidelines — we&apos;ll extract Brand DNA to keep every campaign on-message.
        </p>
      </div>

      <div className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div>
            <label
              htmlFor="project-name"
              className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Project name
            </label>
            <input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Summer launch, Q3 content, Client — Acme…"
              className={cn(
                "w-full rounded-xl border border-violet-200 px-4 py-2.5 text-sm text-indigo-950",
                "placeholder:text-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20",
              )}
            />
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Use a name your team will recognize — e.g. a client, product line, or campaign
              quarter.
            </p>
          </div>

          <BrandSourcesField
            sources={brandSources}
            onChange={(sources) => {
              setBrandSources(sources);
              if (sources.length > 0) setSourceError(null);
            }}
            error={sourceError}
          />
        </div>

        {extracting && (
          <div className="mt-6">
            <TypingIndicator label="Analyzing brand sources…" />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "mt-6 w-full cursor-pointer rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white",
            "transition-colors duration-200 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60",
            "sm:w-auto sm:min-w-[12rem]",
          )}
        >
          {loading ? "Creating…" : "Create project"}
        </button>
      </div>

      {error && (
        <div className="mt-4">
          <ContextCard title="Could not create project" variant="error">
            {error}
          </ContextCard>
        </div>
      )}
    </form>
  );
}
