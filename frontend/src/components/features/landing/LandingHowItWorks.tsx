"use client";

import { cn } from "@/lib/utils";
import { demoStepLabels, demoSteps, useLandingDemo } from "./LandingDemoContext";

const stepDetails = [
  {
    title: "Drop your source material",
    description:
      "URL, PDF, YouTube link, or paste raw text. The quality gate ensures enough substance before agents run.",
  },
  {
    title: "Agents extract insights",
    description:
      "Extractor parses angles, stats, and audience signals into structured fields for downstream agents.",
  },
  {
    title: "Writer drafts per platform",
    description:
      "Platform-native copy for LinkedIn, X, Instagram, and Facebook — tuned to length and tone.",
  },
  {
    title: "Image agent picks visuals",
    description:
      "Custom AI art, stock photos, or text-only — with a budget cap of four generated images per campaign.",
  },
  {
    title: "Review and approve",
    description:
      "Every post lands in pending approval. Edit, regenerate, or approve — then export or schedule.",
  },
];

export function LandingHowItWorks() {
  const { step, setStep, stepIndex } = useLandingDemo();

  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-violet-700">
            How it works
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">
            Guided tour — {demoStepLabels[step]} step
          </h2>
        </div>

        <ol className="mt-16 grid gap-4 md:grid-cols-5">
          {demoSteps.map((demoStep, index) => {
            const active = step === demoStep;
            const detail = stepDetails[index];

            return (
              <li key={demoStep}>
                <button
                  type="button"
                  onClick={() => {
                    setStep(demoStep);
                    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className={cn(
                    "flex h-full w-full cursor-pointer flex-col items-start rounded-2xl border p-5 text-left",
                    "transition-colors duration-200",
                    active
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-violet-200 bg-white hover:border-cyan-300 hover:bg-violet-50/50",
                  )}
                >
                  <span
                    className={cn(
                      "mb-4 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                      active ? "bg-white/20 text-white" : "bg-violet-100 text-violet-700",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className={cn(
                      "text-sm font-semibold",
                      active ? "text-white" : "text-indigo-950",
                    )}
                  >
                    {detail.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-2 text-xs leading-relaxed",
                      active ? "text-violet-100" : "text-slate-600",
                    )}
                  >
                    {detail.description}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 text-center text-sm text-slate-600">
          Step {stepIndex + 1} of {demoSteps.length} — switch steps in the demo or click above
        </p>
      </div>
    </section>
  );
}
