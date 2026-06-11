import type { CampaignOutput } from "@/types/campaign";
import { AiMessage } from "@/components/features/campaign/ConversationMessages";

type Angle = { title: string; hook: string };
type Insight = { label: string; value: string };

type BrainstormOutputProps = {
  output: CampaignOutput;
};

export function BrainstormOutput({ output }: BrainstormOutputProps) {
  const metadata = output.metadata ?? {};
  const insights = (metadata.insights as Insight[] | undefined) ?? [];
  const angles = (metadata.angles as Angle[] | undefined) ?? [];
  const stats = (metadata.stats as string[] | undefined) ?? [];
  const quotes = (metadata.quotes as string[] | undefined) ?? [];
  const audience = metadata.audience as string | undefined;

  return (
    <>
      {insights.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {insights.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-violet-200 bg-white p-4 transition-colors duration-200 hover:border-violet-300 hover:bg-violet-50/40"
            >
              <p className="text-xs font-medium text-violet-700">{item.label}</p>
              <p className="mt-1 text-sm text-indigo-950">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {audience && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Audience
          </span>
          <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm text-violet-800">
            {audience}
          </span>
        </div>
      )}

      {angles.length > 0 && (
        <AiMessage agent="Brainstorm angles">
          <ol className="space-y-3">
            {angles.map((angle, index) => (
              <li
                key={angle.title}
                className="rounded-xl border border-violet-100 bg-violet-50/30 px-4 py-3"
              >
                <p className="text-xs font-medium text-violet-600">
                  Angle {index + 1}: {angle.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-indigo-950">{angle.hook}</p>
              </li>
            ))}
          </ol>
        </AiMessage>
      )}

      {stats.length > 0 && (
        <AiMessage agent="Extract brief">
          <ul className="space-y-2">
            {stats.map((stat) => (
              <li key={stat} className="flex items-start gap-2 text-sm text-slate-700">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500"
                  aria-hidden
                />
                {stat}
              </li>
            ))}
          </ul>
        </AiMessage>
      )}

      {quotes.length > 0 && (
        <AiMessage agent="Brainstorm angles">
          <div className="space-y-2">
            {quotes.map((quote) => (
              <p
                key={quote}
                className="border-l-2 border-violet-300 pl-3 text-sm italic text-slate-600"
              >
                &ldquo;{quote}&rdquo;
              </p>
            ))}
          </div>
        </AiMessage>
      )}
    </>
  );
}
