"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type DemoStep = "brief" | "extract" | "write" | "image" | "review";

export const demoSteps: DemoStep[] = ["brief", "extract", "write", "image", "review"];

export const demoStepLabels: Record<DemoStep, string> = {
  brief: "Brief",
  extract: "Extract",
  write: "Write",
  image: "Image",
  review: "Review",
};

type LandingDemoContextValue = {
  step: DemoStep;
  setStep: (step: DemoStep) => void;
  stepIndex: number;
};

const LandingDemoContext = createContext<LandingDemoContextValue | null>(null);

export function LandingDemoProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<DemoStep>("brief");
  const stepIndex = demoSteps.indexOf(step);

  return (
    <LandingDemoContext.Provider value={{ step, setStep, stepIndex }}>
      {children}
    </LandingDemoContext.Provider>
  );
}

export function useLandingDemo() {
  const context = useContext(LandingDemoContext);
  if (!context) {
    throw new Error("useLandingDemo must be used within LandingDemoProvider");
  }
  return context;
}
