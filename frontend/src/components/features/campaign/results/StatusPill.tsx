import { cn } from "@/lib/utils";

type StatusPillProps = {
  status: string;
};

export function StatusPill({ status }: StatusPillProps) {
  const styles: Record<string, string> = {
    draft: "bg-violet-100 text-violet-800",
    queued: "bg-amber-100 text-amber-800",
    running: "bg-violet-100 text-violet-700",
    review: "bg-orange-100 text-orange-800",
    completed: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium capitalize",
        styles[status] ?? styles.draft,
      )}
    >
      {status === "running" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" aria-hidden />
      )}
      {status.replace("_", " ")}
    </span>
  );
}
