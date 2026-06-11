import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingCta() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl bg-indigo-950 px-8 py-16 text-center sm:px-16",
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.35),transparent_60%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"
          />

          <div className="relative">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to run the real pipeline?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-violet-200">
              You explored the demo — now paste your brief and let the agents generate
              copy, visuals, and a review queue.
            </p>
            <Link
              href="/projects/new"
              className={cn(
                "mt-8 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5",
                "text-base font-medium text-white transition-colors duration-200 hover:bg-cyan-400",
              )}
            >
              Start generating
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
