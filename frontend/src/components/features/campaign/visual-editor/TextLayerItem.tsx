"use client";

import { useEffect, useRef, useState } from "react";
import type { TextLayer } from "@/types/visual-editor";
import { clientToNormalized, normalizedToPercent } from "@/lib/image-editor-geometry";
import { cn } from "@/lib/utils";

type TextLayerItemProps = {
  layer: TextLayer;
  isActive: boolean;
  onSelect: () => void;
  onChange: (layer: TextLayer) => void;
  onRemove: () => void;
  getGeometry: () => {
    containerRect: DOMRect;
    renderRect: { offsetX: number; offsetY: number; width: number; height: number };
  } | null;
};

export function TextLayerItem({
  layer,
  isActive,
  onSelect,
  onChange,
  onRemove,
  getGeometry,
}: TextLayerItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.textContent !== layer.content) {
      ref.current.textContent = layer.content;
    }
  }, [layer.id, layer.content]);

  useEffect(() => {
    if (!isActive || !ref.current) return;
    ref.current.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(ref.current);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, [isActive]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("[data-text-controls]")) return;
    onSelect();
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.stopPropagation();
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const geometry = getGeometry();
    if (!geometry) return;

    const point = clientToNormalized(
      event.clientX,
      event.clientY,
      geometry.containerRect,
      geometry.renderRect,
    );

    onChange({
      ...layer,
      x: Math.min(Math.max(point.x, 0), 1 - layer.width),
      y: Math.min(Math.max(point.y, 0), 0.95),
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div
      data-text-layer
      className="absolute"
      style={{
        left: normalizedToPercent(layer.x),
        top: normalizedToPercent(layer.y),
        width: normalizedToPercent(layer.width),
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) =>
          onChange({ ...layer, content: event.currentTarget.textContent ?? "" })
        }
        className={cn(
          "min-h-[1.5em] whitespace-pre-wrap break-words px-1 py-0.5 outline-none",
          isActive && "ring-2 ring-violet-500 ring-offset-1 ring-offset-transparent",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{
          fontSize: layer.fontSize,
          color: layer.color,
          textShadow: "0 1px 3px rgba(0,0,0,0.55)",
        }}
      />

      {isActive && (
        <div
          data-text-controls
          className={cn(
            "absolute -top-9 left-0 flex items-center gap-1 rounded-lg border border-violet-200",
            "bg-white p-1 shadow-md",
          )}
        >
          <input
            type="color"
            value={layer.color}
            onChange={(event) => onChange({ ...layer, color: event.target.value })}
            aria-label="Text color"
            className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
          />
          <input
            type="range"
            min={12}
            max={48}
            value={layer.fontSize}
            onChange={(event) =>
              onChange({ ...layer, fontSize: Number(event.target.value) })
            }
            aria-label="Font size"
            className="w-16 accent-violet-600"
          />
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              "cursor-pointer rounded px-1.5 py-0.5 text-[10px] text-red-600",
              "hover:bg-red-50",
            )}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
