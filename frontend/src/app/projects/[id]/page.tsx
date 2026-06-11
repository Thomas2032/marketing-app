import { CampaignForm } from "@/components/CampaignForm";
import { CampaignShell } from "@/components/features/campaign/CampaignShell";
import { ProjectCampaignList } from "@/components/features/project/ProjectCampaignList";
import { ProjectSubNav } from "@/components/features/project/ProjectSubNav";
import { ProjectWorkspaceHeader } from "@/components/features/project/ProjectWorkspaceHeader";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  return (
    <CampaignShell activeProjectId={id} backHref="/" backLabel="← Home">
      <ProjectWorkspaceHeader projectId={id} />
      <ProjectSubNav projectId={id} />
      <ProjectCampaignList projectId={id} />
      <CampaignForm projectId={id} />
    </CampaignShell>
  );
}
