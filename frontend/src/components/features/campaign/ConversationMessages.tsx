import { cn } from "@/lib/utils";

type ContextCardProps = {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "success" | "error";
  className?: string;
};

export function ContextCard({
  title,
  children,
  variant = "default",
  className,
}: ContextCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm sm:p-5",
        variant === "default" && "border-violet-200",
        variant === "success" && "border-emerald-200 bg-emerald-50/40",
        variant === "error" && "border-red-200 bg-red-50/40",
        className,
      )}
    >
      <p
        className={cn(
          "mb-2 text-xs font-medium uppercase tracking-wide",
          variant === "default" && "text-violet-700",
          variant === "success" && "text-emerald-700",
          variant === "error" && "text-red-700",
        )}
      >
        {title}
      </p>
      <div
        className={cn(
          "text-sm leading-relaxed",
          variant === "default" && "text-slate-700",
          variant === "success" && "text-emerald-800",
          variant === "error" && "text-red-800",
        )}
      >
        {children}
      </div>
    </article>
  );
}

type UserMessageProps = {
  children: React.ReactNode;
};

export function UserMessage({ children }: UserMessageProps) {
  return (
    <article className="flex flex-col items-end gap-2">
      <p className="text-xs font-medium text-slate-500">You</p>
      <div
        className={cn(
          "max-w-[92%] rounded-2xl rounded-br-md border border-violet-200 bg-violet-100/60",
          "px-4 py-3 text-base leading-relaxed text-indigo-950 sm:max-w-xl",
        )}
      >
        <p className="whitespace-pre-wrap">{children}</p>
      </div>
    </article>
  );
}

type AiMessageProps = {
  agent: string;
  children: React.ReactNode;
};

export function AiMessage({ agent, children }: AiMessageProps) {
  return (
    <article className="flex flex-col gap-2">
      <p className="text-xs font-medium text-violet-700">{agent}</p>
      <div
        className={cn(
          "rounded-2xl rounded-bl-md border border-violet-200/80 border-l-4 border-l-violet-600",
          "bg-white px-4 py-3 shadow-sm",
        )}
      >
        {children}
      </div>
    </article>
  );
}
