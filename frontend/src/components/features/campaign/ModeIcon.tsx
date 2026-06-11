import { Image, Lightbulb, PenLine, Wand2 } from "lucide-react";
import type { TaskType } from "@/types/campaign";
import { cn } from "@/lib/utils";

type ModeIconProps = {
  mode?: TaskType | null;
  className?: string;
};

export function ModeIcon({ mode, className }: ModeIconProps) {
  const iconClass = cn("h-4 w-4 shrink-0", className);

  if (mode === "Brainstorm") {
    return <Lightbulb className={iconClass} aria-hidden />;
  }

  if (mode === "Copywriting") {
    return <PenLine className={iconClass} aria-hidden />;
  }

  if (mode === "Visual Asset") {
    return <Image className={iconClass} aria-hidden />;
  }

  return <Wand2 className={iconClass} aria-hidden />;
}

export function getModeIconLabel(mode?: TaskType | null): string {
  if (mode === "Brainstorm") return "Brainstorm";
  if (mode === "Copywriting") return "Copywriting";
  if (mode === "Visual Asset") return "Visual Asset";
  return "Campaign";
}
