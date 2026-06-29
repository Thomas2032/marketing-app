"use client";

import { useRef, useState } from "react";
import { FileUp, Plus, X } from "lucide-react";
import type { BrandSource, BrandSourceType } from "@/types/project";
import { inferSourceLabel } from "@/lib/mock-brand-dna";
import { cn } from "@/lib/utils";

const SOURCE_TYPE_LABELS: Record<BrandSourceType, string> = {
  website: "Website",
  brand_page: "Brand page",
  document: "Document",
  other: "Other",
};

type BrandSourcesFieldProps = {
  sources: BrandSource[];
  onChange: (sources: BrandSource[]) => void;
  error?: string | null;
};

export function BrandSourcesField({ sources, onChange, error }: BrandSourcesFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceType, setSourceType] = useState<BrandSourceType>("website");
  const [inputValue, setInputValue] = useState("");

  function addSource(value: string, type: BrandSourceType) {
    const trimmed = value.trim();
    if (!trimmed) return;

    const source: BrandSource = {
      id: `src-${crypto.randomUUID()}`,
      type,
      label: inferSourceLabel(type, trimmed),
      value: trimmed,
    };
    onChange([...sources, source]);
    setInputValue("");
  }

  function handleAddClick() {
    addSource(inputValue, sourceType);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      addSource(inputValue, sourceType);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    addSource(`file://${file.name}`, "document");
    event.target.value = "";
  }

  function removeSource(id: string) {
    onChange(sources.filter((s) => s.id !== id));
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
        Brand sources
      </label>
      <p className="mb-3 text-xs text-slate-500">
        Add your product site, brand guidelines, or landing pages — we&apos;ll build Brand DNA for
        campaigns.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value as BrandSourceType)}
          className={cn(
            "rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm text-indigo-950",
            "outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20",
          )}
        >
          {(Object.keys(SOURCE_TYPE_LABELS) as BrandSourceType[]).map((type) => (
            <option key={type} value={type}>
              {SOURCE_TYPE_LABELS[type]}
            </option>
          ))}
        </select>

        <input
          id="brand-source-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://yourcompany.com or link to brand doc"
          className={cn(
            "min-w-0 flex-1 rounded-xl border border-violet-200 px-4 py-2.5 text-sm text-indigo-950",
            "placeholder:text-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20",
          )}
        />

        <button
          type="button"
          onClick={handleAddClick}
          className={cn(
            "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl",
            "border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-800",
            "transition-colors duration-200 hover:bg-violet-100",
          )}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add
        </button>
      </div>

      <div className="mt-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.md"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-violet-700",
            "transition-colors duration-200 hover:text-violet-900",
          )}
        >
          <FileUp className="h-3.5 w-3.5" aria-hidden />
          Attach document (preview only)
        </button>
      </div>

      {sources.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {sources.map((source) => (
            <li
              key={source.id}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-violet-200",
                "bg-violet-50 px-3 py-1.5 text-xs text-indigo-950",
              )}
            >
              <span className="font-medium text-violet-700">
                {SOURCE_TYPE_LABELS[source.type]}:
              </span>
              <span className="max-w-[12rem] truncate">{source.label}</span>
              <button
                type="button"
                aria-label={`Remove ${source.label}`}
                onClick={() => removeSource(source.id)}
                className="cursor-pointer rounded-full p-0.5 text-slate-500 transition-colors hover:bg-violet-200 hover:text-violet-900"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
