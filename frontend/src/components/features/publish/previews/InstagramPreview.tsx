import { ImageIcon } from "lucide-react";
import { PREVIEW_AUTHOR, PREVIEW_PLACEHOLDER } from "@/lib/platform-preview";
import { cn } from "@/lib/utils";

type InstagramPreviewProps = {
  text: string;
  imageUrl: string | null;
  authorName?: string;
};

export function InstagramPreview({
  text,
  imageUrl,
  authorName = PREVIEW_AUTHOR.name,
}: InstagramPreviewProps) {
  const body = text.trim() || PREVIEW_PLACEHOLDER;
  const handle = PREVIEW_AUTHOR.handle;

  return (
    <div
      aria-label="Instagram post preview"
      className="cursor-default overflow-hidden rounded-lg border border-slate-200 bg-white"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-[10px] font-bold text-white"
          aria-hidden
        >
          {authorName.charAt(0)}
        </span>
        <span className="text-xs font-semibold text-indigo-950">{handle}</span>
      </div>

      {imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={imageUrl} alt="" className="aspect-square w-full object-cover" />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-violet-100 to-cyan-50">
          <ImageIcon className="h-10 w-10 text-violet-300" aria-hidden />
        </div>
      )}

      <div className="p-3">
        <p className="text-sm leading-relaxed text-slate-800">
          <span className="font-semibold text-indigo-950">{handle}</span>{" "}
          <span className={cn(!text.trim() && "text-slate-400 italic")}>{body}</span>
        </p>
      </div>
    </div>
  );
}
