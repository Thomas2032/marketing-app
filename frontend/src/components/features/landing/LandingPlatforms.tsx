import { cn } from "@/lib/utils";

const platforms = [
  {
    name: "LinkedIn",
    description: "Thought-leadership posts and professional hooks tuned for feed engagement.",
    accent: "bg-[#0A66C2]",
  },
  {
    name: "X",
    description: "Punchy threads and single posts within character limits.",
    accent: "bg-zinc-900",
  },
  {
    name: "Instagram",
    description: "Caption-first copy with visual pairing for Stories and feed.",
    accent: "bg-gradient-to-br from-violet-600 to-pink-500",
  },
  {
    name: "Facebook",
    description: "Community-friendly tone with longer-form options when the angle fits.",
    accent: "bg-[#1877F2]",
  },
];

export function LandingPlatforms() {
  return (
    <section id="platforms" className="border-t border-violet-100 bg-violet-50/50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-violet-700">
            Platforms
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">
            One brief, every channel covered
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Switch platform tabs in the Write step of the demo to preview adapted copy for each
            network.
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {platforms.map((platform) => (
            <article
              key={platform.name}
              className={cn(
                "rounded-2xl border border-violet-200 bg-white p-5",
                "transition-colors duration-200 hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-100/40",
              )}
            >
              <div className={cn("mb-4 h-2 w-10 rounded-full", platform.accent)} />
              <h3 className="text-base font-semibold text-indigo-950">{platform.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {platform.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
