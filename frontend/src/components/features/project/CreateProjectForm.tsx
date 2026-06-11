"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import { createProject } from "@/lib/mock-projects";
import { ContextCard } from "@/components/features/campaign/ConversationMessages";
import { cn } from "@/lib/utils";

export function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Project name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    const project = createProject(trimmed, description);
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    router.push(`/projects/${project.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg">
      <div className="mb-8 text-center">
        <p className="mb-3 flex items-center justify-center gap-2 text-sm text-slate-600">
          <FolderPlus className="h-4 w-4 text-violet-600" aria-hidden />
          Start with a project
        </p>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight text-indigo-950">
          Create your first project
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Projects organize campaigns, brand context, and generated outputs. You need a project
          before prompting the orchestrator.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-violet-200 bg-white p-5 shadow-sm">
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
        </div>

        <div>
          <label
            htmlFor="project-description"
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Description (optional)
          </label>
          <textarea
            id="project-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="What is this project for?"
            className={cn(
              "w-full resize-none rounded-xl border border-violet-200 px-4 py-2.5 text-sm text-indigo-950",
              "placeholder:text-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20",
            )}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full cursor-pointer rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white",
            "transition-colors duration-200 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60",
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
