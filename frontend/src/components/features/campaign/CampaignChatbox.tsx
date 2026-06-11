"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Plug, Plus, X } from "lucide-react";
import type { TaskType } from "@/types/campaign";
import { cn } from "@/lib/utils";

type CampaignChatboxProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder: string;
  inputId?: string;
  inputLabel?: string;
  submitLabel?: string;
  taskType?: TaskType | null;
  onClearTaskType?: () => void;
  rows?: number;
};

export function CampaignChatbox({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
  inputId = "campaign-message",
  inputLabel = "Message",
  submitLabel = "Send message",
  taskType = null,
  onClearTaskType,
  rows = 3,
}: CampaignChatboxProps) {
  const [visiblePlaceholder, setVisiblePlaceholder] = useState(placeholder);
  const [placeholderFading, setPlaceholderFading] = useState(false);
  const showPlaceholder = value.trim().length === 0;
  const canSubmit = value.trim().length > 0 && !disabled;

  useEffect(() => {
    if (placeholder === visiblePlaceholder) return;

    setPlaceholderFading(true);
    const timeout = window.setTimeout(() => {
      setVisiblePlaceholder(placeholder);
      setPlaceholderFading(false);
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [placeholder, visiblePlaceholder]);

  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white p-4 shadow-sm",
        "transition-[transform,box-shadow] duration-300 ease-in-out",
        disabled && "opacity-70",
      )}
    >
      <label htmlFor={inputId} className="sr-only">
        {inputLabel}
      </label>
      <div className="relative">
        {showPlaceholder && (
          <p
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 text-base leading-relaxed text-slate-400",
              "transition-opacity duration-300 ease-in-out",
              placeholderFading ? "opacity-0" : "opacity-100",
            )}
          >
            {visiblePlaceholder}
          </p>
        )}
        <textarea
          id={inputId}
          rows={rows}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSubmit) onSubmit();
            }
          }}
          className={cn(
            "min-h-[4.5rem] w-full resize-none bg-transparent text-base leading-relaxed text-slate-800",
            "outline-none",
          )}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ChatboxIconButton icon={Plus} tooltip="Add files" disabled={disabled} />
          <ChatboxIconButton icon={Plug} tooltip="Connect Social media" disabled={disabled} />
          {taskType && onClearTaskType && (
            <div
              className={cn(
                "grid transition-[grid-template-columns,opacity,margin] duration-300 ease-in-out",
                "ml-0 grid-cols-[1fr] opacity-100",
              )}
            >
              <div className="overflow-hidden">
                <button
                  type="button"
                  onClick={onClearTaskType}
                  disabled={disabled}
                  title={`Change mode (${taskType})`}
                  className={cn(
                    "group inline-flex cursor-pointer items-center gap-1.5 rounded-full",
                    "border border-violet-200 bg-violet-50 px-3 py-1.5",
                    "text-xs font-medium text-violet-700",
                    "transition-[colors,transform] duration-300 ease-in-out",
                    "hover:border-violet-300 hover:bg-violet-100",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
                  )}
                >
                  {taskType}
                  <X
                    className={cn(
                      "h-3 w-0 shrink-0 overflow-hidden opacity-0",
                      "transition-all duration-200 group-hover:w-3 group-hover:opacity-100",
                    )}
                    aria-hidden
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            aria-label={submitLabel}
            title={submitLabel}
            className={cn(
              "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-100",
              "text-slate-600 transition-colors duration-200",
              "hover:bg-slate-200 hover:text-slate-900",
              "disabled:cursor-not-allowed disabled:opacity-40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
            )}
          >
            <ArrowUp className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

type ChatboxIconButtonProps = {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tooltip: string;
  disabled?: boolean;
};

function ChatboxIconButton({ icon: Icon, tooltip, disabled }: ChatboxIconButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={tooltip}
      title={tooltip}
      className={cn(
        "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full",
        "border border-slate-200 text-slate-500 transition-colors duration-200",
        "hover:border-slate-300 hover:text-slate-700",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}
