import type { SocialPlatform } from "@/types/publish";
import { FacebookPreview } from "@/components/features/publish/previews/FacebookPreview";
import { InstagramPreview } from "@/components/features/publish/previews/InstagramPreview";
import { LinkedInPreview } from "@/components/features/publish/previews/LinkedInPreview";
import { XPreview } from "@/components/features/publish/previews/XPreview";
import { cn } from "@/lib/utils";

type PlatformPostPreviewProps = {
  platform: SocialPlatform;
  text: string;
  imageUrl: string | null;
  authorName?: string;
  overLimit?: boolean;
};

export function PlatformPostPreview({
  platform,
  text,
  imageUrl,
  authorName,
  overLimit = false,
}: PlatformPostPreviewProps) {
  const previewProps = { text, imageUrl, authorName };

  return (
    <div
      className={cn(
        "rounded-xl border bg-slate-50/50 p-3",
        overLimit ? "border-red-200" : "border-violet-100",
      )}
    >
      {platform === "LinkedIn" && <LinkedInPreview {...previewProps} />}
      {platform === "X" && <XPreview {...previewProps} />}
      {platform === "Instagram" && <InstagramPreview {...previewProps} />}
      {platform === "Facebook" && <FacebookPreview {...previewProps} />}
    </div>
  );
}
