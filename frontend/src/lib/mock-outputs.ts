import type { CampaignOutput } from "@/types/campaign";

function nowIso() {
  return new Date().toISOString();
}

export function mockCopyOutput(): CampaignOutput {
  return {
    id: "mock-copy",
    output_type: "copy",
    content: [
      "**LinkedIn**",
      "Launch day is here. Our new line cuts setup time by 40% — built for teams who ship fast.",
      "",
      "**X**",
      "40% faster setup. Same quality. Launch day.",
      "",
      "**Instagram**",
      "Built for speed. Designed for quality. Your launch starts now.",
      "",
      "**Facebook**",
      "Meet the product line built to help your team move faster without cutting corners.",
    ].join("\n"),
    asset_url: null,
    metadata: {},
    created_at: nowIso(),
  };
}

export function mockCopywritingOutput(): CampaignOutput {
  return {
    id: "mock-copywriting",
    output_type: "copy",
    content: null,
    asset_url: null,
    metadata: {
      platforms: {
        LinkedIn:
          "Launch day is here. Our new line cuts setup time by 40% — built for teams who ship fast.",
        X: "40% faster setup. Same quality. Launch day.",
        Instagram: "Built for speed. Designed for quality. Your launch starts now.",
        Facebook:
          "Meet the product line built to help your team move faster without cutting corners.",
      },
      overall_score: 8.6,
      strengths: ["Clear value prop on LinkedIn", "Platform-appropriate tone on X"],
      suggestions: ["Add a CTA link on Instagram", "Test a shorter hook for Facebook"],
    },
    created_at: nowIso(),
  };
}

export function mockBrainstormOutput(): CampaignOutput {
  return {
    id: "mock-brainstorm",
    output_type: "brainstorm",
    content: null,
    asset_url: null,
    metadata: {
      audience: "Growth marketers at mid-size SaaS companies",
      angles: [
        { title: "Speed without sacrifice", hook: "40% faster setup, enterprise-grade quality" },
        { title: "Launch-week urgency", hook: "Limited-time onboarding support for early adopters" },
        { title: "Team velocity", hook: "Built for teams who ship fast" },
        { title: "Data-driven growth", hook: "Turn analytics into action in minutes, not days" },
      ],
      stats: ["40% faster setup", "3x faster campaign creation", "Used by 500+ marketing teams"],
      quotes: [
        "Built for teams who ship fast",
        "From brief to multi-platform posts in one flow",
        "Stop rewriting the same message four times",
      ],
      insights: [
        { label: "Angle", value: "Speed without sacrifice" },
        { label: "Stat", value: "40% faster setup" },
        { label: "Audience", value: "Growth marketers" },
        { label: "Quote hook", value: "Built for teams who ship fast" },
      ],
    },
    created_at: nowIso(),
  };
}

export function mockImageOutput(): CampaignOutput {
  return {
    id: "mock-image",
    output_type: "image",
    content: "Product launch hero — clean SaaS dashboard on gradient background",
    asset_url:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    metadata: { source: "unsplash" },
    created_at: nowIso(),
  };
}

export function mockVisualAssetOutput(): CampaignOutput {
  return {
    id: "mock-visual-asset",
    output_type: "image",
    content: "Product launch hero — clean SaaS dashboard on gradient background",
    asset_url:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    metadata: {
      prompt: "Product launch hero — clean SaaS dashboard on gradient background",
      source: "dall-e",
      variants: [
        {
          id: "ai",
          label: "AI generated",
          type: "dall-e",
          aspectRatio: "1:1",
          asset_url:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
          status: "ready",
        },
        {
          id: "stock",
          label: "Stock photo",
          type: "unsplash",
          aspectRatio: "4:5",
          asset_url:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
          status: "ready",
        },
        {
          id: "text-only",
          label: "Text-only post",
          type: "text-only",
          aspectRatio: "16:9",
          asset_url: null,
          status: "ready",
        },
      ],
    },
    created_at: nowIso(),
  };
}

export function mockReviewOutput(): CampaignOutput {
  return {
    id: "mock-review",
    output_type: "review",
    content: null,
    asset_url: null,
    metadata: {
      overall_score: 8.6,
      strengths: ["Clear value prop on LinkedIn", "Platform-appropriate tone on X"],
      suggestions: ["Add a CTA link on Instagram", "Test a shorter hook for Facebook"],
    },
    created_at: nowIso(),
  };
}
