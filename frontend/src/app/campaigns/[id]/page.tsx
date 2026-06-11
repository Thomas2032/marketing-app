import { CampaignResults } from "@/components/CampaignResults";
import { CampaignShell } from "@/components/features/campaign/CampaignShell";

interface CampaignPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { id } = await params;

  return (
    <CampaignShell activeCampaignId={id}>
      <CampaignResults campaignId={id} />
    </CampaignShell>
  );
}
