"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Dna } from "lucide-react";
import type { BrandDna } from "@/types/project";
import { getProject } from "@/lib/mock-projects";
import { cn } from "@/lib/utils";

type BrandDnaCardProps = {
  projectId: string;
  variant?: "full" | "sidebar";
};

export function BrandDnaCard({ projectId, variant = "full" }: BrandDnaCardProps) {
  const [dna, setDna] = useState<BrandDna | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    getProject(projectId).then((project) => {
      setDna(project?.brand_dna ?? null);
    });
  }, [projectId]);

  if (!dna) return null;

  const isSidebar = variant === "sidebar";

  return (
    <section
      className={cn(
        "rounded-2xl border border-violet-200 bg-white shadow-sm",
        isSidebar ? "" : "mb-6",
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left",
          "transition-colors duration-200 hover:bg-violet-50/50",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
            <Dna className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-indigo-950">Brand DNA</h2>
            <p className="text-xs text-slate-500">
              Preview — extracted from your sources
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200",
            expanded && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {!expanded && isSidebar && (
        <div className="border-t border-violet-100 px-5 py-4">
          <p className="text-sm font-medium text-indigo-950">{dna.tagline}</p>
          <p className="mt-1 text-xs text-slate-600">{dna.tone}</p>
        </div>
      )}

      {expanded && (
        <div className="space-y-5 border-t border-violet-100 px-5 py-4">
          <div className={cn("grid gap-4", isSidebar ? "sm:grid-cols-2" : "lg:grid-cols-3")}>
            <DnaHighlight label="Tagline" value={dna.tagline} className={isSidebar ? "sm:col-span-2" : "lg:col-span-3"} />
            <DnaHighlight label="Tone" value={dna.tone} />
            <DnaHighlight label="Audience" value={dna.target_audience} />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Voice traits
            </p>
            <div className="flex flex-wrap gap-2">
              {dna.voice_traits.map((trait) => (
                <span
                  key={trait}
                  className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          <DnaList label="Key messages" items={dna.key_messages} numbered />

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Color palette
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {dna.colors.map((color) => (
                <div
                  key={color.hex}
                  className="flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50/40 px-3 py-2"
                >
                  <span
                    className="h-7 w-7 shrink-0 rounded-md border border-violet-200"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-indigo-950">{color.name}</p>
                    <p className="font-mono text-[10px] text-slate-400">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DnaList label="Do say" items={dna.do_say} variant="positive" />
            <DnaList label="Don't say" items={dna.dont_say} variant="negative" />
          </div>
        </div>
      )}
    </section>
  );
}

type DnaHighlightProps = {
  label: string;
  value: string;
  className?: string;
};

function DnaHighlight({ label, value, className }: DnaHighlightProps) {
  return (
    <div className={cn("rounded-xl border border-violet-100 bg-violet-50/30 px-4 py-3", className)}>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm leading-relaxed text-indigo-950">{value}</p>
    </div>
  );
}

type DnaListProps = {
  label: string;
  items: string[];
  variant?: "default" | "positive" | "negative";
  numbered?: boolean;
};

function DnaList({ label, items, variant = "default", numbered }: DnaListProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li
            key={item}
            className={cn(
              "text-sm leading-relaxed",
              variant === "positive" && "text-emerald-800",
              variant === "negative" && "text-red-700",
              variant === "default" && "text-indigo-950",
            )}
          >
            {numbered ? (
              <span className="flex gap-2">
                <span className="shrink-0 font-medium text-violet-600">{index + 1}.</span>
                <span>{item}</span>
              </span>
            ) : (
              <>· {item}</>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
