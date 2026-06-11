import Link from "next/link";
import { Share2 } from "lucide-react";
import { ContextCard } from "@/components/features/campaign/ConversationMessages";
import { cn } from "@/lib/utils";

type PublishEntryCardProps = {
  projectId: string;
  campaignId: string;
};

export function PublishEntryCard({ projectId, campaignId }: PublishEntryCardProps) {
  return (
    <ContextCard title="Ready to publish" variant="success">
      <p className="mb-3 text-sm text-emerald-800">
        Add this run&apos;s copy to your publish queue and batch schedule to social.
      </p>
      <Link
        href={`/projects/${projectId}/publish?campaignId=${campaignId}`}
        className={cn(
          "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5",
          "text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-600",
        )}
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Add copy to publish queue
      </Link>
    </ContextCard>
  );
}
