import type { Metadata } from "next";
import { LandingCta } from "@/components/features/landing/LandingCta";
import { LandingDemoProvider } from "@/components/features/landing/LandingDemoContext";
import { LandingFeatures } from "@/components/features/landing/LandingFeatures";
import { LandingFooter } from "@/components/features/landing/LandingFooter";
import { LandingHero } from "@/components/features/landing/LandingHero";
import { LandingHowItWorks } from "@/components/features/landing/LandingHowItWorks";
import { LandingNavbar } from "@/components/features/landing/LandingNavbar";
import { LandingPlatforms } from "@/components/features/landing/LandingPlatforms";

export const metadata: Metadata = {
  title: "Marketing App — AI campaign generator",
  description:
    "Turn one brief into multi-platform marketing campaigns. Try the interactive demo — AI agents extract, write, generate visuals, and queue assets for approval.",
};

export default function Home() {
  return (
    <LandingDemoProvider>
      <div className="min-h-full bg-[#FAF5FF]">
        <LandingNavbar />
        <main>
          <LandingHero />
          <LandingFeatures />
          <LandingHowItWorks />
          <LandingPlatforms />
          <LandingCta />
        </main>
        <LandingFooter />
      </div>
    </LandingDemoProvider>
  );
}
