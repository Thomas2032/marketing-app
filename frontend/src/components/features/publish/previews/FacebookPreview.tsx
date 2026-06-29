import { ThumbsUp } from "lucide-react";
import { PreviewAuthorRow } from "@/components/features/publish/previews/PreviewAuthorRow";
import { PREVIEW_PLACEHOLDER } from "@/lib/platform-preview";
import { cn } from "@/lib/utils";

type FacebookPreviewProps = {
  text: string;
  imageUrl: string | null;
  authorName?: string;
};

export function FacebookPreview({ text, imageUrl, authorName }: FacebookPreviewProps) {
  const body = text.trim() || PREVIEW_PLACEHOLDER;

  return (
    <div
      aria-label="Facebook post preview"
      className="cursor-default overflow-hidden rounded-lg border border-slate-200 bg-white"
    >
      <div className="p-3">
        <PreviewAuthorRow name={authorName} subtitle="Just now" />
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
        <img src={imageUrl} alt="" className="w-full object-cover" />
      )}

      <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
        <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
        <span>Like · Comment · Share</span>
      </div>
    </div>
  );
}
