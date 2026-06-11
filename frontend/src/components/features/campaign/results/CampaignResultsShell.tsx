import type { Campaign } from "@/types/campaign";
import { StatusPill } from "@/components/features/campaign/results/StatusPill";

type CampaignResultsShellProps = {
  campaign: Campaign;
  children: React.ReactNode;
};

export function CampaignResultsShell({ campaign, children }: CampaignResultsShellProps) {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <header className="space-y-2">
        <StatusPill status={campaign.status} />
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold tracking-tight text-indigo-950 sm:text-3xl">
          {campaign.title}
        </h1>
      </header>

      {children}
    </div>
  );
}
