import { MousePointer2, Sparkles, SquareDashed, Type, X } from "lucide-react";
import type { EditorTool } from "@/types/visual-editor";
import { cn } from "@/lib/utils";

type ImageEditorToolbarProps = {
  activeTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  onClose: () => void;
  onRequestAi: () => void;
  selectionCount: number;
  textCount: number;
};

export function ImageEditorToolbar({
  activeTool,
  onToolChange,
  onClose,
  onRequestAi,
  selectionCount,
  textCount,
}: ImageEditorToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-xl border border-white/20 bg-indigo-950/90 p-1.5 shadow-lg backdrop-blur-md",
      )}
      role="toolbar"
      aria-label="Image editor tools"
    >
      <ToolButton
        active={activeTool === "select"}
        label="Select object"
        onClick={() => onToolChange("select")}
      >
        <MousePointer2 className="h-4 w-4" aria-hidden />
      </ToolButton>

      <ToolButton
        active={activeTool === "draw"}
        label="Draw AI edit region"
        onClick={() => onToolChange("draw")}
      >
        <SquareDashed className="h-4 w-4" aria-hidden />
      </ToolButton>

      <ToolButton
        active={activeTool === "text"}
        label="Add or edit text"
        onClick={() => onToolChange("text")}
      >
        <Type className="h-4 w-4" aria-hidden />
      </ToolButton>

      <div className="mx-1 hidden h-6 w-px bg-white/20 sm:block" aria-hidden />

      <span className="hidden px-2 text-[10px] text-violet-200 sm:inline">
        {selectionCount} AI region{selectionCount === 1 ? "" : "s"} · {textCount} text
      </span>

      <button
        type="button"
        onClick={onRequestAi}
        className={cn(
          "ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium",
          "bg-violet-600 text-white transition-colors duration-200 hover:bg-violet-500",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
        )}
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        AI edit
      </button>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close editor"
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-violet-200",
          "transition-colors duration-200 hover:bg-white/10 hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
        )}
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

type ToolButtonProps = {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
};

function ToolButton({ active, label, onClick, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-lg p-2 transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
        active ? "bg-violet-600 text-white" : "text-violet-100 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}
