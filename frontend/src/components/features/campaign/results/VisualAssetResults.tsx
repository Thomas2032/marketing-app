"use client";

import { useEffect, useState } from "react";
import type { CampaignOutput } from "@/types/campaign";
import { cn } from "@/lib/utils";
import { AiMessage, ContextCard } from "@/components/features/campaign/ConversationMessages";
import { VisualImageEditor } from "@/components/features/campaign/visual-editor/VisualImageEditor";

type VisualVariant = {
  id: string;
  label: string;
  type: string;
  aspectRatio: string;
  asset_url: string | null;
  status: string;
};

type ImageOutputProps = {
  output: CampaignOutput;
};

export function ImageOutput({ output }: ImageOutputProps) {
  const metadata = output.metadata ?? {};
  const prompt = (metadata.prompt as string | undefined) ?? output.content ?? "";
  const variants = (metadata.variants as VisualVariant[] | undefined) ?? [];
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "ai");

  useEffect(() => {
    if (variants.length > 0 && !variants.some((variant) => variant.id === selectedId)) {
      setSelectedId(variants[0].id);
    }
  }, [variants, selectedId]);

  const selected = variants.find((variant) => variant.id === selectedId) ?? variants[0];

  return (
    <>
      {prompt && (
        <ContextCard title="Image prompt">
          <p className="text-sm leading-relaxed text-slate-700">{prompt}</p>
          {typeof metadata.source === "string" && (
            <p className="mt-2 text-xs text-slate-500">Source: {metadata.source}</p>
          )}
        </ContextCard>
      )}

      {variants.length > 0 && (
        <AiMessage agent="Generate visual">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedId(variant.id)}
                  className={cn(
                    "cursor-pointer overflow-hidden rounded-xl border transition-colors duration-200",
                    selectedId === variant.id
                      ? "border-violet-600 ring-2 ring-violet-600/20"
                      : "border-violet-200 hover:border-violet-300",
                  )}
                >
                  {variant.asset_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={variant.asset_url}
                      alt={variant.label}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center bg-violet-50/50">
                      <p className="px-3 text-center text-xs text-slate-600">{variant.label}</p>
                    </div>
                  )}
                  <div className="border-t border-violet-100 bg-white px-3 py-2 text-left">
                    <p className="text-xs font-medium text-indigo-950">{variant.label}</p>
                    <p className="text-[10px] text-slate-500">{variant.aspectRatio}</p>
                  </div>
                </button>
              ))}
            </div>

            {selected?.asset_url && (
              <VisualImageEditor src={selected.asset_url} alt={selected.label} />
            )}
          </div>
        </AiMessage>
      )}

      {output.asset_url && variants.length === 0 && (
        <AiMessage agent="Generate visual">
          <VisualImageEditor src={output.asset_url} alt="Generated campaign visual" />
        </AiMessage>
      )}

      {output.content && !output.asset_url && variants.length === 0 && (
        <AiMessage agent="Generate visual">
          <p className="text-base leading-relaxed text-slate-700">{output.content}</p>
        </AiMessage>
      )}
    </>
  );
}
