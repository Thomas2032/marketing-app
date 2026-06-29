import type { BrandDna, BrandSource, BrandSourceType } from "@/types/project";

export function inferSourceLabel(type: BrandSourceType, value: string): string {
  if (type === "document" && value.startsWith("file://")) {
    return value.replace("file://", "");
  }
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return value.slice(0, 40) + (value.length > 40 ? "…" : "");
  }
}

function hostnameFromSources(sources: BrandSource[]): string {
  const website = sources.find((s) => s.type === "website" || s.type === "brand_page");
  if (!website) return "your brand";
  try {
    const url = new URL(
      website.value.startsWith("http") ? website.value : `https://${website.value}`,
    );
    const host = url.hostname.replace(/^www\./, "");
    const name = host.split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return website.label;
  }
}

export function generateMockBrandDna(sources: BrandSource[]): BrandDna {
  const brandName = hostnameFromSources(sources);

  return {
    extracted_at: new Date().toISOString(),
    tone: "Confident, professional, and approachable",
    voice_traits: ["Clear", "Direct", "Human", "Product-led"],
    target_audience: "Growth marketers and marketing ops leads at mid-size B2B SaaS companies",
    tagline: `${brandName} — built for teams who ship fast`,
    key_messages: [
      `Save time without sacrificing quality with ${brandName}`,
      "Async collaboration that keeps campaigns moving",
      "From brief to multi-platform posts in one flow",
    ],
    colors: [
      { name: "Primary violet", hex: "#7C3AED" },
      { name: "Deep indigo", hex: "#312E81" },
      { name: "Accent cyan", hex: "#06B6D4" },
    ],
    do_say: [
      "Focus on outcomes and speed",
      "Use active voice and concrete benefits",
      "Speak to marketing team pain points",
    ],
    dont_say: [
      "Avoid jargon-heavy enterprise speak",
      "Don't overpromise unrealistic ROI",
      "Skip generic 'synergy' or 'leverage' phrasing",
    ],
  };
}
