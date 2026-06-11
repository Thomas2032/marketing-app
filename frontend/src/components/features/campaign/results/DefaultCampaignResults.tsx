import type { CampaignOutput } from "@/types/campaign";
import { AiMessage } from "@/components/features/campaign/ConversationMessages";

type PlainCopyOutputProps = {
  output: CampaignOutput;
};

export function PlainCopyOutput({ output }: PlainCopyOutputProps) {
  if (!output.content) return null;

  return (
    <AiMessage agent="Write copy">
      <pre className="streaming-reveal whitespace-pre-wrap font-[family-name:var(--font-dm-sans)] text-base leading-relaxed text-slate-700">
        {output.content}
      </pre>
    </AiMessage>
  );
}

type ReviewOutputProps = {
  output: CampaignOutput;
};

export function ReviewOutput({ output }: ReviewOutputProps) {
  if (!output.metadata || Object.keys(output.metadata).length === 0) return null;

  return (
    <AiMessage agent="Review outputs">
      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
        {JSON.stringify(output.metadata, null, 2)}
      </pre>
    </AiMessage>
  );
}
