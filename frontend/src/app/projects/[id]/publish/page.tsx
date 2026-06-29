import { Suspense } from "react";
import { CampaignShell } from "@/components/features/campaign/CampaignShell";
import { ProjectWorkspace } from "@/components/features/project/ProjectWorkspace";
import { PublishWizard } from "@/components/features/publish/PublishWizard";
import { TypingIndicator } from "@/components/features/campaign/TypingIndicator";

interface PublishPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublishPage({ params }: PublishPageProps) {
  const { id } = await params;

  return (
    <CampaignShell activeProjectId={id} backHref="/" backLabel="← Home" contentWidth="wide">
      <ProjectWorkspace projectId={id}>
        <Suspense
          fallback={
            <div className="py-16">
              <TypingIndicator label="Loading publish wizard…" />
            </div>
          }
        >
          <PublishWizard projectId={id} />
        </Suspense>
      </ProjectWorkspace>
    </CampaignShell>
  );
}
