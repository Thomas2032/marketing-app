export type BrandSourceType = "website" | "brand_page" | "document" | "other";

export type BrandSource = {
  id: string;
  type: BrandSourceType;
  label: string;
  value: string;
};

export type BrandDna = {
  extracted_at: string;
  tone: string;
  voice_traits: string[];
  target_audience: string;
  tagline: string;
  key_messages: string[];
  colors: { name: string; hex: string }[];
  do_say: string[];
  dont_say: string[];
};

export interface Project {
  id: string;
  name: string;
  description: string | null;
  brand_sources?: BrandSource[];
  brand_dna?: BrandDna | null;
  created_at: string;
  updated_at: string;
}
