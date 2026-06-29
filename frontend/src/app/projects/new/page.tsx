import { CampaignShell } from "@/components/features/campaign/CampaignShell";
import { CreateProjectForm } from "@/components/features/project/CreateProjectForm";

export default function NewProjectPage() {
  return (
    <CampaignShell backHref="/" backLabel="← Home" contentWidth="wide">
      <CreateProjectForm />
    </CampaignShell>
  );
}
