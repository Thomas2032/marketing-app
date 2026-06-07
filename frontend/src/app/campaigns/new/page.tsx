import { CampaignForm } from "@/components/CampaignForm";
import { CampaignShell } from "@/components/features/campaign/CampaignShell";

export default function NewCampaignPage() {
  return (
    <CampaignShell backHref="/" backLabel="← Home">
      <CampaignForm />
    </CampaignShell>
  );
}
