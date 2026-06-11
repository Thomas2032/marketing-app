"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EditorTool, SelectionRegion, TextLayer } from "@/types/visual-editor";
import {
  clientToNormalized,
  getImageRenderRect,
  normalizeRect,
  normalizedToPercent,
  type RenderRect,
} from "@/lib/image-editor-geometry";
import { cn } from "@/lib/utils";
import { TextLayerItem } from "@/components/features/campaign/visual-editor/TextLayerItem";

type ImageEditorSurfaceProps = {
  src: string;
  alt: string;
  activeTool: EditorTool;
  textLayers: TextLayer[];
  selections: SelectionRegion[];
  activeTextId: string | null;
  activeSelectionId: string | null;
  onTextLayersChange: (layers: TextLayer[]) => void;
  onSelectionsChange: (regions: SelectionRegion[]) => void;
  onActiveTextChange: (id: string | null) => void;
  onActiveSelectionChange: (id: string | null) => void;
};

type DraftRect = { startX: number; startY: number; endX: number; endY: number };

export function ImageEditorSurface({
  src,
  alt,
  activeTool,
  textLayers,
  selections,
  activeTextId,
  activeSelectionId,
  onTextLayersChange,
  onSelectionsChange,
  onActiveTextChange,
  onActiveSelectionChange,
}: ImageEditorSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [draftRect, setDraftRect] = useState<DraftRect | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [renderRect, setRenderRect] = useState<RenderRect | null>(null);

  const getGeometry = useCallback(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return null;

    const containerRect = container.getBoundingClientRect();
    const imageRenderRect = getImageRenderRect(
      containerRect.width,
      containerRect.height,
      image.naturalWidth,
      image.naturalHeight,
    );

    return { containerRect, renderRect: imageRenderRect };
  }, []);

  const syncRenderRect = useCallback(() => {
    const geometry = getGeometry();
    if (geometry) setRenderRect(geometry.renderRect);
  }, [getGeometry]);

  useEffect(() => {
    syncRenderRect();
    window.addEventListener("resize", syncRenderRect);
    return () => window.removeEventListener("resize", syncRenderRect);
  }, [syncRenderRect, src]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (activeTool !== "draw") return;
    if ((event.target as HTMLElement).closest("[data-ai-region], [data-text-layer]")) return;
    const geometry = getGeometry();
    if (!geometry) return;

    const point = clientToNormalized(
      event.clientX,
      event.clientY,
      geometry.containerRect,
      geometry.renderRect,
    );

    onActiveSelectionChange(null);
    onActiveTextChange(null);
    setIsDragging(true);
    setDraftRect({
      startX: point.x,
      startY: point.y,
      endX: point.x,
      endY: point.y,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || !draftRect) return;
    const geometry = getGeometry();
    if (!geometry) return;

    const point = clientToNormalized(
      event.clientX,
      event.clientY,
      geometry.containerRect,
      geometry.renderRect,
    );

    setDraftRect({ ...draftRect, endX: point.x, endY: point.y });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || !draftRect) return;

    const rect = normalizeRect(
      { x: draftRect.startX, y: draftRect.startY },
      { x: draftRect.endX, y: draftRect.endY },
    );

    const id = `sel-${crypto.randomUUID()}`;
    const next: SelectionRegion = { id, ...rect, changePrompt: "" };
    onSelectionsChange([...selections, next]);
    onActiveSelectionChange(id);
    setDraftRect(null);
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleSurfaceClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;

    if (activeTool === "select") {
      if (!target.closest("[data-ai-region], [data-text-layer]")) {
        onActiveTextChange(null);
        onActiveSelectionChange(null);
      }
      return;
    }

    if (activeTool !== "text") return;
    if (target.closest("[data-text-layer]")) return;

    const geometry = getGeometry();
    if (!geometry) return;

    const point = clientToNormalized(
      event.clientX,
      event.clientY,
      geometry.containerRect,
      geometry.renderRect,
    );

    const id = `txt-${crypto.randomUUID()}`;
    const layer: TextLayer = {
      id,
      x: point.x,
      y: point.y,
      width: 0.28,
      content: "Your text",
      fontSize: 18,
      color: "#ffffff",
    };

    onTextLayersChange([...textLayers, layer]);
    onActiveTextChange(id);
    onActiveSelectionChange(null);
  }

  const draftNormalized = draftRect
    ? normalizeRect(
        { x: draftRect.startX, y: draftRect.startY },
        { x: draftRect.endX, y: draftRect.endY },
        0.005,
      )
    : null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-900/5",
        activeTool === "select" && "cursor-default",
        activeTool === "draw" && "cursor-crosshair",
        activeTool === "text" && "cursor-text",
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleSurfaceClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        onLoad={syncRenderRect}
        className="absolute inset-0 h-full w-full object-contain"
        draggable={false}
      />

      <div
        className="absolute"
        style={
          renderRect
            ? {
                left: renderRect.offsetX,
                top: renderRect.offsetY,
                width: renderRect.width,
                height: renderRect.height,
              }
            : { inset: 0 }
        }
      >
        {selections.map((region, index) => (
          <button
            key={region.id}
            type="button"
            data-ai-region
            aria-label={`AI edit region ${index + 1}`}
            onClick={(event) => {
              event.stopPropagation();
              onActiveSelectionChange(region.id);
              onActiveTextChange(null);
            }}
            className={cn(
              "absolute border-2 border-dashed transition-colors duration-200",
              activeSelectionId === region.id
                ? "border-cyan-400 bg-cyan-400/15"
                : "border-violet-400/80 bg-violet-500/10",
            )}
            style={{
              left: normalizedToPercent(region.x),
              top: normalizedToPercent(region.y),
              width: normalizedToPercent(region.width),
              height: normalizedToPercent(region.height),
            }}
          >
            <span
              className={cn(
                "absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center",
                "rounded-full bg-indigo-950 text-[10px] font-bold text-white shadow",
              )}
            >
              {index + 1}
            </span>
          </button>
        ))}

        {draftNormalized && (
          <div
            className="absolute border-2 border-dashed border-cyan-300 bg-cyan-300/10"
            style={{
              left: normalizedToPercent(draftNormalized.x),
              top: normalizedToPercent(draftNormalized.y),
              width: normalizedToPercent(draftNormalized.width),
              height: normalizedToPercent(draftNormalized.height),
            }}
          />
        )}
      </div>

      <div
        className="absolute"
        style={
          renderRect
            ? {
                left: renderRect.offsetX,
                top: renderRect.offsetY,
                width: renderRect.width,
                height: renderRect.height,
              }
            : { inset: 0 }
        }
      >
        {textLayers.map((layer) => (
          <TextLayerItem
            key={layer.id}
            layer={layer}
            isActive={activeTextId === layer.id}
            onSelect={() => {
              onActiveTextChange(layer.id);
              onActiveSelectionChange(null);
            }}
            onChange={(next) =>
              onTextLayersChange(textLayers.map((item) => (item.id === layer.id ? next : item)))
            }
            onRemove={() => {
              onTextLayersChange(textLayers.filter((item) => item.id !== layer.id));
              if (activeTextId === layer.id) onActiveTextChange(null);
            }}
            getGeometry={getGeometry}
          />
        ))}
      </div>
    </div>
  );
}
