import Link from "next/link";
import { cn } from "@/lib/utils";

type LandingNavbarProps = {
  className?: string;
};

export function LandingNavbar({ className }: LandingNavbarProps) {
  return (
    <header
      className={cn(
        "fixed top-4 left-4 right-4 z-50 mx-auto max-w-6xl",
        className,
      )}
    >
      <nav
        className={cn(
          "flex items-center justify-between rounded-2xl border border-violet-200/80",
          "bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6",
        )}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white">
            M
          </span>
          <span className="text-base font-semibold text-indigo-950">Marketing App</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#demo"
            className="cursor-pointer text-sm text-slate-600 transition-colors duration-200 hover:text-violet-700"
          >
            Demo
          </a>
          <a
            href="#features"
            className="cursor-pointer text-sm text-slate-600 transition-colors duration-200 hover:text-violet-700"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="cursor-pointer text-sm text-slate-600 transition-colors duration-200 hover:text-violet-700"
          >
            How it works
          </a>
          <a
            href="#platforms"
            className="cursor-pointer text-sm text-slate-600 transition-colors duration-200 hover:text-violet-700"
          >
            Platforms
          </a>
        </div>

        <Link
          href="/campaigns/new"
          className={cn(
            "cursor-pointer rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-white",
            "transition-colors duration-200 hover:bg-cyan-600",
          )}
        >
          Start free
        </Link>
      </nav>
    </header>
  );
}
