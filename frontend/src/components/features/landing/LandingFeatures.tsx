"use client";

import { Bot, ImageIcon, PenLine, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { demoSteps, useLandingDemo, type DemoStep } from "./LandingDemoContext";

const features: {
  step: DemoStep;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}[] = [
  {
    step: "extract",
    icon: Bot,
    title: "Smart extraction",
    description:
      "Pull key quotes, stats, and angles from URLs, PDFs, YouTube links, or raw text — with a quality gate that asks for more when input is thin.",
  },
  {
    step: "write",
    icon: PenLine,
    title: "Platform-native copy",
    description:
      "Writer agents adapt tone and length for LinkedIn, X, Instagram, and Facebook. Brand voice improves as you approve more posts.",
  },
  {
    step: "image",
    icon: ImageIcon,
    title: "Visuals on demand",
    description:
      "Each post gets a deliberate image strategy: custom AI art, stock photos, or text-only — capped at four generated images per campaign.",
  },
  {
    step: "review",
    icon: ShieldCheck,
    title: "Human review gate",
    description:
      "Nothing auto-publishes. Edit, regenerate, or delete each asset in a grid before you approve and export or schedule.",
  },
];

export function LandingFeatures() {
  const { step, setStep } = useLandingDemo();

  return (
    <section id="features" className="border-t border-violet-100 bg-violet-50/50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-violet-700">
            Features
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">
            Click a feature to jump in the demo
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Each card syncs with the interactive mockup above — hover for details, click to
            reveal that step.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              active={step === feature.step}
              onSelect={() => {
                setStep(feature.step);
                document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type FeatureCardProps = {
  step: DemoStep;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  active: boolean;
  onSelect: () => void;
};

function FeatureCard({
  icon: Icon,
  title,
  description,
  active,
  onSelect,
}: FeatureCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "cursor-pointer rounded-2xl border bg-white p-6 text-left transition-colors duration-200",
        active
          ? "border-violet-600 shadow-lg shadow-violet-200/60 ring-2 ring-violet-600/20"
          : "border-violet-200 hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-100/50",
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200",
          active ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-700",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-indigo-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <p className="mt-4 text-xs font-medium text-cyan-600">
        {active ? "Showing in demo ↑" : "Show in demo →"}
      </p>
    </button>
  );
}
