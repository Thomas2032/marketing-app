import { CampaignForm } from "@/components/CampaignForm";
import { CampaignShell } from "@/components/features/campaign/CampaignShell";
import { ProjectWorkspace } from "@/components/features/project/ProjectWorkspace";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  return (
    <CampaignShell activeProjectId={id} backHref="/" backLabel="← Home" contentWidth="wide">
      <ProjectWorkspace projectId={id}>
        <CampaignForm projectId={id} />
      </ProjectWorkspace>
    </CampaignShell>
  );
}
