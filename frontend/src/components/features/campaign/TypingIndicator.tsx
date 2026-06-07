import { cn } from "@/lib/utils";

type TypingIndicatorProps = {
  label?: string;
  className?: string;
};

export function TypingIndicator({ label, className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <p className="text-sm text-slate-600">{label}</p>}
      <div className="flex items-center gap-1.5" role="status" aria-label={label ?? "Loading"}>
        <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500 [animation-delay:300ms]" />
      </div>
    </div>
  );
}
