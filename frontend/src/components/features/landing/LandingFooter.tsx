import Link from "next/link";
import { cn } from "@/lib/utils";

export function LandingFooter() {
  return (
    <footer className="border-t border-violet-100 bg-white py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600",
              "text-xs font-bold text-white",
            )}
          >
            M
          </span>
          <span className="text-sm font-medium text-indigo-950">Marketing App</span>
        </div>

        <p className="text-sm text-slate-600">
          AI-powered campaign generation with human approval at every step.
        </p>

        <Link
          href="/projects/new"
          className="cursor-pointer text-sm font-medium text-violet-700 transition-colors duration-200 hover:text-cyan-600"
        >
          Create campaign →
        </Link>
      </div>
    </footer>
  );
}
