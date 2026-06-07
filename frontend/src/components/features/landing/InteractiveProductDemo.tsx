"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  demoStepLabels,
  demoSteps,
  useLandingDemo,
  type DemoStep,
} from "./LandingDemoContext";

const platformCopy: Record<string, string> = {
  LinkedIn:
    "Launch day is here. Our new line cuts setup time by 40% — built for teams who ship fast.",
  X: "40% faster setup. Same quality. Launch day. 🚀",
  Instagram: "Built for speed. Designed for quality. Your launch starts now.",
  Facebook: "Meet the product line built to help your team move faster without cutting corners.",
};

export function InteractiveProductDemo() {
  const { step, setStep, stepIndex } = useLandingDemo();

  function goNext() {
    if (stepIndex < demoSteps.length - 1) {
      setStep(demoSteps[stepIndex + 1]);
    }
  }

  function goPrev() {
    if (stepIndex > 0) {
      setStep(demoSteps[stepIndex - 1]);
    }
  }

  return (
    <div
      id="demo"
      className="overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-2xl shadow-violet-200/40"
    >
      <DemoToolbar step={step} onStepChange={setStep} />

      <div className="relative min-h-[340px] bg-violet-50/50 p-5 sm:p-6">
        <StepProgress stepIndex={stepIndex} />
        {step === "brief" && <BriefStep />}
        {step === "extract" && <ExtractStep />}
        {step === "write" && <WriteStep />}
        {step === "image" && <ImageStep />}
        {step === "review" && <ReviewStep />}
      </div>

      <div className="flex items-center justify-between border-t border-violet-100 bg-white px-5 py-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={stepIndex === 0}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium",
            "text-indigo-950 transition-colors duration-200 hover:bg-violet-50",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <p className="hidden text-xs text-slate-600 sm:block">
          <MousePointerClick className="mr-1 inline h-3.5 w-3.5" aria-hidden />
          Click steps or hover hotspots to explore
        </p>
        <button
          type="button"
          onClick={goNext}
          disabled={stepIndex === demoSteps.length - 1}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1 rounded-lg bg-cyan-500 px-3 py-1.5",
            "text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-600",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function DemoToolbar({
  step,
  onStepChange,
}: {
  step: DemoStep;
  onStepChange: (step: DemoStep) => void;
}) {
  return (
    <div className="border-b border-violet-100 bg-white px-4 py-3">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="ml-2 text-xs text-slate-600">Marketing App — Live demo</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {demoSteps.map((demoStep, index) => (
          <button
            key={demoStep}
            type="button"
            onClick={() => onStepChange(demoStep)}
            className={cn(
              "cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-200",
              step === demoStep
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-violet-200 bg-violet-50 text-indigo-950 hover:border-violet-300 hover:bg-violet-100",
            )}
          >
            {index + 1}. {demoStepLabels[demoStep]}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepProgress({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="mb-5">
      <div className="h-1.5 overflow-hidden rounded-full bg-violet-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-300"
          style={{ width: `${((stepIndex + 1) / demoSteps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

function Hotspot({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "group absolute z-10 cursor-pointer",
        className,
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white ring-4 ring-cyan-500/20 transition-colors duration-200 group-hover:bg-cyan-600">
        i
      </span>
      <span
        className={cn(
          "pointer-events-none absolute top-6 left-1/2 z-20 w-44 -translate-x-1/2 rounded-lg",
          "border border-violet-200 bg-white px-3 py-2 text-xs text-slate-600 opacity-0 shadow-lg",
          "transition-opacity duration-200 group-hover:opacity-100",
        )}
      >
        {label}
      </span>
    </span>
  );
}

function BriefStep() {
  return (
    <div className="relative rounded-xl border border-violet-200 bg-white p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-violet-700">
        Campaign brief
      </p>
      <p className="text-sm leading-relaxed text-slate-600">
        Summer product launch for our SaaS analytics tool. Target: growth marketers.
        Key message: 40% faster setup, enterprise-grade quality.
      </p>
      <Hotspot
        label="Quality gate checks word count and clarity before agents run."
        className="right-4 top-4"
      />
    </div>
  );
}

function ExtractStep() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        { label: "Angle", value: "Speed without sacrifice" },
        { label: "Stat", value: "40% faster setup" },
        { label: "Audience", value: "Growth marketers" },
        { label: "Quote hook", value: "Built for teams who ship fast" },
      ].map((item) => (
        <div
          key={item.label}
          className="group relative rounded-xl border border-violet-200 bg-white p-4 transition-colors duration-200 hover:border-cyan-300 hover:bg-cyan-50/30"
        >
          <p className="text-xs font-medium text-violet-700">{item.label}</p>
          <p className="mt-1 text-sm text-indigo-950">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function WriteStep() {
  const [platform, setPlatform] = useState("LinkedIn");

  return (
    <div className="relative space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.keys(platformCopy).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setPlatform(name)}
            className={cn(
              "cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-colors duration-200",
              platform === name
                ? "bg-violet-600 text-white"
                : "bg-violet-100 text-indigo-950 hover:bg-violet-200",
            )}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-violet-200 bg-white p-4">
        <p className="mb-2 text-xs font-medium text-cyan-600">{platform}</p>
        <p className="text-sm leading-relaxed text-slate-600">{platformCopy[platform]}</p>
      </div>
      <Hotspot
        label="Writer adapts tone and length per platform automatically."
        className="right-2 top-0"
      />
    </div>
  );
}

function ImageStep() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="relative flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-cyan-300 bg-cyan-50/50">
        <p className="text-xs font-medium text-cyan-700">DALL-E generating…</p>
        <Hotspot label="Up to 4 AI images per campaign." className="right-2 top-2" />
      </div>
      <div className="flex aspect-square items-center justify-center rounded-xl border border-violet-200 bg-violet-100/50">
        <p className="text-xs text-slate-600">Stock photo</p>
      </div>
      <div className="flex aspect-square items-center justify-center rounded-xl border border-violet-200 bg-white">
        <p className="text-xs text-slate-600">Text-only post</p>
      </div>
    </div>
  );
}

function ReviewStep() {
  return (
    <div className="space-y-3">
      {["LinkedIn post", "X thread", "Instagram caption"].map((item, index) => (
        <div
          key={item}
          className="flex items-center justify-between rounded-xl border border-violet-200 bg-white px-4 py-3 transition-colors duration-200 hover:border-violet-300"
        >
          <div>
            <p className="text-sm font-medium text-indigo-950">{item}</p>
            <p className="text-xs text-slate-600">Pending approval</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700 transition-colors duration-200 hover:bg-violet-200"
            >
              Edit
            </button>
            <button
              type="button"
              className={cn(
                "cursor-pointer rounded-lg px-2 py-1 text-xs font-medium transition-colors duration-200",
                index === 0
                  ? "bg-cyan-500 text-white hover:bg-cyan-600"
                  : "bg-violet-100 text-violet-700 hover:bg-violet-200",
              )}
            >
              {index === 0 ? "Approved" : "Approve"}
            </button>
          </div>
        </div>
      ))}
      <Hotspot
        label="Nothing publishes until you approve each asset."
        className="right-4 bottom-0"
      />
    </div>
  );
}
