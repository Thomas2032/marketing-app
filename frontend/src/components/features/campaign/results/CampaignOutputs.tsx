import type { Campaign, CampaignOutput } from "@/types/campaign";
import { isOrchestrating } from "@/lib/campaign-state";
import { OrchestratorActivity } from "@/components/features/campaign/OrchestratorActivity";
import { ContextCard } from "@/components/features/campaign/ConversationMessages";
import { PublishEntryCard } from "@/components/features/publish/PublishEntryCard";
import { BrainstormOutput } from "@/components/features/campaign/results/BrainstormResults";
import { CopyOutput } from "@/components/features/campaign/results/CopywritingResults";
import { ImageOutput } from "@/components/features/campaign/results/VisualAssetResults";
import { PlainCopyOutput, ReviewOutput } from "@/components/features/campaign/results/DefaultCampaignResults";

type CampaignOutputsProps = {
  campaign: Campaign;
};

export function CampaignOutputs({ campaign }: CampaignOutputsProps) {
  const processing = isOrchestrating(campaign);
  const hasOutputs = campaign.outputs.length > 0;
  const hasCopy = campaign.outputs.some((output) => output.output_type === "copy");
  const projectId = campaign.project_id;

  return (
    <>
      <OrchestratorActivity campaign={campaign} />

      {campaign.outputs.map((output) => (
        <OutputBlock key={output.id} output={output} />
      ))}

      {campaign.status === "completed" && hasCopy && projectId && (
        <PublishEntryCard projectId={projectId} campaignId={campaign.id} />
      )}

      {campaign.status === "completed" && hasOutputs && (
        <ContextCard title="Ready for review" variant="success">
          Review the outputs above, then approve or regenerate individual items.
        </ContextCard>
      )}

      {!hasOutputs && !processing && !campaign.error_message && (
        <ContextCard title="Orchestrator">
          Waiting for the first tool to produce output…
        </ContextCard>
      )}
    </>
  );
}

function OutputBlock({ output }: { output: CampaignOutput }) {
  switch (output.output_type) {
    case "brainstorm":
      return <BrainstormOutput output={output} />;
    case "copy":
      if (output.metadata.platforms) {
        return <CopyOutput output={output} />;
      }
      return <PlainCopyOutput output={output} />;
    case "image":
      return <ImageOutput output={output} />;
    case "review":
      return <ReviewOutput output={output} />;
    default:
      return null;
  }
}
