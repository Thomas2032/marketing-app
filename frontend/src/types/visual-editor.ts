export type EditorTool = "select" | "draw" | "text";

export type TextLayer = {
  id: string;
  x: number;
  y: number;
  width: number;
  content: string;
  fontSize: number;
  color: string;
};

export type SelectionRegion = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  changePrompt: string;
};

export type NormalizedRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
