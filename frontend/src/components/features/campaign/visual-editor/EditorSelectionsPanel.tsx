import type { SelectionRegion } from "@/types/visual-editor";
import { cn } from "@/lib/utils";

type EditorSelectionsPanelProps = {
  selections: SelectionRegion[];
  activeSelectionId: string | null;
  onSelect: (id: string) => void;
  onChangePrompt: (id: string, changePrompt: string) => void;
  onRemove: (id: string) => void;
};

export function EditorSelectionsPanel({
  selections,
  activeSelectionId,
  onSelect,
  onChangePrompt,
  onRemove,
}: EditorSelectionsPanelProps) {
  if (selections.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-violet-200 bg-white/95 p-3 shadow-sm backdrop-blur-sm",
      )}
    >
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-violet-700">
        AI change regions
      </p>
      <ul className="space-y-2">
        {selections.map((region, index) => (
          <li key={region.id}>
            <div
              className={cn(
                "rounded-lg border p-2 transition-colors duration-200",
                activeSelectionId === region.id
                  ? "border-violet-400 bg-violet-50/80"
                  : "border-violet-100 bg-violet-50/30",
              )}
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(region.id)}
                  className={cn(
                    "cursor-pointer text-left text-xs font-semibold text-indigo-950",
                    "hover:text-violet-700",
                  )}
                >
                  Region {index + 1}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(region.id)}
                  className={cn(
                    "cursor-pointer text-[10px] text-slate-400 transition-colors duration-200",
                    "hover:text-red-600",
                  )}
                >
                  Remove
                </button>
              </div>
              <textarea
                value={region.changePrompt}
                onChange={(event) => onChangePrompt(region.id, event.target.value)}
                onFocus={() => onSelect(region.id)}
                rows={2}
                placeholder="Describe what AI should change in this area…"
                className={cn(
                  "w-full resize-none rounded-md border border-violet-200 bg-white px-2 py-1.5",
                  "text-xs text-slate-700 placeholder:text-slate-400 outline-none",
                  "focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30",
                )}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
