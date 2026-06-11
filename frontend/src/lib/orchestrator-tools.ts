import type { AgentToolName, TaskType } from "@/types/campaign";

export const toolLabels: Record<AgentToolName, string> = {
  quality_gate: "Quality gate",
  extract_brief: "Extract brief",
  brainstorm_angles: "Brainstorm angles",
  write_copy: "Write copy",
  generate_visual: "Generate visual",
  review_outputs: "Review outputs",
};

export const toolTasks: Record<AgentToolName, string> = {
  quality_gate: "Checking whether the brief has enough substance to proceed.",
  extract_brief: "Parsing quotes, stats, angles, and audience signals.",
  brainstorm_angles: "Exploring campaign angles and positioning hooks.",
  write_copy: "Drafting platform-native copy for each channel.",
  generate_visual: "Creating image prompts and visual variants.",
  review_outputs: "Scoring output and suggesting refinements.",
};

/** Mode hint → tools the orchestrator is nudged to prefer (not a fixed pipeline). */
export function getPreferredToolsForMode(mode: TaskType | null): AgentToolName[] {
  switch (mode) {
    case "Brainstorm":
      return ["quality_gate", "extract_brief", "brainstorm_angles"];
    case "Copywriting":
      return ["quality_gate", "extract_brief", "write_copy", "review_outputs"];
    case "Visual Asset":
      return ["quality_gate", "extract_brief", "generate_visual"];
    default:
      return [
        "quality_gate",
        "extract_brief",
        "write_copy",
        "generate_visual",
        "review_outputs",
      ];
  }
}
