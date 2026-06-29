import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import { PREVIEW_AUTHOR, PREVIEW_PLACEHOLDER } from "@/lib/platform-preview";
import { cn } from "@/lib/utils";

type XPreviewProps = {
  text: string;
  imageUrl: string | null;
  authorName?: string;
};

export function XPreview({ text, imageUrl, authorName = PREVIEW_AUTHOR.name }: XPreviewProps) {
  const body = text.trim() || PREVIEW_PLACEHOLDER;
  const handle = PREVIEW_AUTHOR.handle;

  return (
    <div
      aria-label="X post preview"
      className="cursor-default overflow-hidden rounded-lg border border-slate-200 bg-white p-3"
    >
      <div className="flex gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"
          aria-hidden
        >
          {authorName.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="font-bold text-indigo-950">{authorName}</span>{" "}
            <span className="text-slate-500">@{handle}</span>
          </p>
          <p
            className={cn(
              "mt-1 whitespace-pre-wrap text-sm leading-relaxed",
              text.trim() ? "text-slate-800" : "text-slate-400 italic",
            )}
          >
            {body}
          </p>
          {imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt=""
              className="mt-2 max-h-48 w-full rounded-xl border border-slate-200 object-cover"
            />
          )}
          <div className="mt-3 flex max-w-xs justify-between text-slate-500">
            <MessageCircle className="h-4 w-4" aria-hidden />
            <Repeat2 className="h-4 w-4" aria-hidden />
            <Heart className="h-4 w-4" aria-hidden />
            <Share className="h-4 w-4" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
