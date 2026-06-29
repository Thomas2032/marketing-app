import { cn } from "@/lib/utils";
import { PREVIEW_AUTHOR } from "@/lib/platform-preview";

type PreviewAuthorRowProps = {
  name?: string;
  subtitle?: string;
  className?: string;
};

export function PreviewAuthorRow({
  name = PREVIEW_AUTHOR.name,
  subtitle,
  className,
}: PreviewAuthorRowProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-200 text-xs font-bold text-violet-800"
        aria-hidden
      >
        {name.charAt(0)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-indigo-950">{name}</p>
        {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}
