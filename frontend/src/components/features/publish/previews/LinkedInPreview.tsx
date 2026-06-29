import { MessageCircle, Repeat2, Send, ThumbsUp } from "lucide-react";
import { PreviewAuthorRow } from "@/components/features/publish/previews/PreviewAuthorRow";
import { PREVIEW_AUTHOR, PREVIEW_PLACEHOLDER } from "@/lib/platform-preview";
import { cn } from "@/lib/utils";

type LinkedInPreviewProps = {
  text: string;
  imageUrl: string | null;
  authorName?: string;
};

export function LinkedInPreview({ text, imageUrl, authorName }: LinkedInPreviewProps) {
  const body = text.trim() || PREVIEW_PLACEHOLDER;

  return (
    <div
      aria-label="LinkedIn post preview"
      className="cursor-default overflow-hidden rounded-lg border border-slate-200 bg-white"
    >
      <div className="p-3">
        <PreviewAuthorRow
          name={authorName}
          subtitle={`${PREVIEW_AUTHOR.headline} · 1h`}
        />
        <p
          className={cn(
            "mt-3 whitespace-pre-wrap text-sm leading-relaxed",
            text.trim() ? "text-slate-800" : "text-slate-400 italic",
          )}
        >
          {body}
        </p>
      </div>

      {imageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={imageUrl} alt="" className="aspect-[1.91/1] w-full object-cover" />
      )}

      <div className="flex items-center justify-around border-t border-slate-100 px-2 py-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
          Like
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          Comment
        </span>
        <span className="inline-flex items-center gap-1">
          <Repeat2 className="h-3.5 w-3.5" aria-hidden />
          Repost
        </span>
        <span className="inline-flex items-center gap-1">
          <Send className="h-3.5 w-3.5" aria-hidden />
          Send
        </span>
      </div>
    </div>
  );
}
