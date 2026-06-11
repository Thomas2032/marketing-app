import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { InteractiveProductDemo } from "./InteractiveProductDemo";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.15),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-20 right-0 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm text-violet-800">
              <Sparkles className="h-4 w-4" aria-hidden />
              Interactive product demo — try the pipeline
            </div>

            <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold tracking-tight text-indigo-950 sm:text-5xl">
              Turn one brief into{" "}
              <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
                multi-platform campaigns
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Explore the live mockup on the right — step through brief, extraction,
              copy, visuals, and approval. No signup required.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/projects/new"
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5",
                  "text-base font-medium text-white transition-colors duration-200 hover:bg-cyan-600",
                )}
              >
                Try with your brief
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#features"
                className={cn(
                  "inline-flex cursor-pointer items-center rounded-xl border border-violet-200 bg-white px-6 py-3.5",
                  "text-base font-medium text-indigo-950 transition-colors duration-200 hover:border-violet-300 hover:bg-violet-50",
                )}
              >
                Explore features
              </a>
            </div>
          </div>

          <InteractiveProductDemo />
        </div>
      </div>
    </section>
  );
}
