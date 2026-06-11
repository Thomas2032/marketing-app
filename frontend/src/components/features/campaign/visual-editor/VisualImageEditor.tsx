"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { EditorTool, SelectionRegion, TextLayer } from "@/types/visual-editor";
import { cn } from "@/lib/utils";
import { EditorSelectionsPanel } from "@/components/features/campaign/visual-editor/EditorSelectionsPanel";
import { ImageEditorSurface } from "@/components/features/campaign/visual-editor/ImageEditorSurface";
import { ImageEditorToolbar } from "@/components/features/campaign/visual-editor/ImageEditorToolbar";

type VisualImageEditorProps = {
  src: string;
  alt: string;
  className?: string;
};

export function VisualImageEditor({ src, alt, className }: VisualImageEditorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [activeTool, setActiveTool] = useState<EditorTool>("select");
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selections, setSelections] = useState<SelectionRegion[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [activeSelectionId, setActiveSelectionId] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const showChrome = isHovered || isActive;

  function openEditor() {
    setIsActive(true);
    setIsHovered(true);
  }

  function closeEditor() {
    setIsActive(false);
    setIsHovered(false);
    setActiveTextId(null);
    setActiveSelectionId(null);
    setAiNotice(null);
  }

  function handleRequestAi() {
    const labeled = selections.filter((region) => region.changePrompt.trim().length > 0);
    if (labeled.length === 0 && textLayers.length === 0) {
      setAiNotice("Add a selection region or text layer before requesting an AI edit.");
      return;
    }

    setAiNotice(
      `AI edit queued (UI preview) — ${labeled.length} region${labeled.length === 1 ? "" : "s"}, ${textLayers.length} text layer${textLayers.length === 1 ? "" : "s"}.`,
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          if (!isActive) setIsHovered(false);
        }}
      >
        {!isActive ? (
          <button
            type="button"
            onClick={openEditor}
            className={cn("relative block w-full cursor-pointer text-left")}
            aria-label="Open image editor"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className={cn(
                "max-h-[28rem] w-full rounded-xl border border-violet-200 object-contain",
                "transition-opacity duration-200",
                showChrome && "opacity-95",
              )}
            />
            <div
              className={cn(
                "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2",
                "rounded-xl bg-indigo-950/0 transition-all duration-200",
                showChrome && "bg-indigo-950/35",
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-white/30 bg-indigo-950/80",
                  "px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm",
                  "translate-y-1 opacity-0 transition-all duration-200",
                  showChrome && "translate-y-0 opacity-100",
                )}
              >
                <Pencil className="h-4 w-4" aria-hidden />
                Edit visual
              </span>
              <span
                className={cn(
                  "text-xs text-white/90 opacity-0 transition-opacity duration-200",
                  showChrome && "opacity-100",
                )}
              >
                Select · Draw · Text
              </span>
            </div>
          </button>
        ) : (
          <div className="overflow-hidden rounded-xl border border-violet-300 bg-white shadow-md">
            <div className="border-b border-violet-100 bg-violet-50/50 px-3 py-2">
              <ImageEditorToolbar
                activeTool={activeTool}
                onToolChange={setActiveTool}
                onClose={closeEditor}
                onRequestAi={handleRequestAi}
                selectionCount={selections.length}
                textCount={textLayers.length}
              />
            </div>

            <div className="grid gap-3 p-3 lg:grid-cols-[1fr_220px]">
              <ImageEditorSurface
                src={src}
                alt={alt}
                activeTool={activeTool}
                textLayers={textLayers}
                selections={selections}
                activeTextId={activeTextId}
                activeSelectionId={activeSelectionId}
                onTextLayersChange={setTextLayers}
                onSelectionsChange={setSelections}
                onActiveTextChange={setActiveTextId}
                onActiveSelectionChange={setActiveSelectionId}
              />

              <div className="flex flex-col gap-2">
                <EditorSelectionsPanel
                  selections={selections}
                  activeSelectionId={activeSelectionId}
                  onSelect={setActiveSelectionId}
                  onChangePrompt={(id, changePrompt) =>
                    setSelections((items) =>
                      items.map((item) => (item.id === id ? { ...item, changePrompt } : item)),
                    )
                  }
                  onRemove={(id) => {
                    setSelections((items) => items.filter((item) => item.id !== id));
                    if (activeSelectionId === id) setActiveSelectionId(null);
                  }}
                />

                {activeTool === "select" && (
                  <p className="rounded-lg border border-dashed border-violet-200 bg-violet-50/40 px-3 py-2 text-xs text-slate-600">
                    Click text layers or AI regions to select them. Click empty space to deselect.
                  </p>
                )}

                {activeTool === "draw" && (
                  <p className="rounded-lg border border-dashed border-violet-200 bg-violet-50/40 px-3 py-2 text-xs text-slate-600">
                    Drag on the image to draw a region and describe what AI should change there.
                  </p>
                )}

                {activeTool === "text" && (
                  <p className="rounded-lg border border-dashed border-violet-200 bg-violet-50/40 px-3 py-2 text-xs text-slate-600">
                    Click the image to place text. Drag to reposition; use the toolbar above
                    selected text to adjust style.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {aiNotice && (
        <p className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-900">
          {aiNotice}
        </p>
      )}
    </div>
  );
}
