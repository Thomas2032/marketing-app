import type { Campaign, CampaignOutput } from "@/types/campaign";
import type { CopyHistoryItem, SocialPlatform } from "@/types/publish";
import { socialPlatforms } from "@/types/publish";
import { getMockCampaign, listMockCampaignSummaries } from "@/lib/mock-campaign";

function isSocialPlatform(value: string): value is SocialPlatform {
  return socialPlatforms.includes(value as SocialPlatform);
}

function getImageUrlFromCampaign(campaign: Campaign): string | null {
  const imageOutput = campaign.outputs.find((output) => output.output_type === "image");
  if (!imageOutput) return null;

  if (imageOutput.asset_url) return imageOutput.asset_url;

  const variants = imageOutput.metadata.variants;
  if (!Array.isArray(variants) || variants.length === 0) return null;

  const first = variants[0] as { asset_url?: string | null };
  return first.asset_url ?? null;
}

function parseMarkdownPlatforms(content: string): Partial<Record<SocialPlatform, string>> {
  const result: Partial<Record<SocialPlatform, string>> = {};
  const sections = content.split(/\*\*([^*]+)\*\*/);

  for (let index = 1; index < sections.length; index += 2) {
    const label = sections[index].trim();
    const body = (sections[index + 1] ?? "").trim();
    if (isSocialPlatform(label) && body) {
      result[label] = body;
    }
  }

  return result;
}

function extractPlatformsFromOutput(
  output: CampaignOutput,
): Partial<Record<SocialPlatform, string>> {
  const structured = output.metadata.platforms;
  if (structured && typeof structured === "object") {
    const result: Partial<Record<SocialPlatform, string>> = {};
    for (const [key, value] of Object.entries(structured as Record<string, string>)) {
      if (isSocialPlatform(key) && typeof value === "string" && value.trim()) {
        result[key] = value.trim();
      }
    }
    if (Object.keys(result).length > 0) return result;
  }

  if (output.content) {
    return parseMarkdownPlatforms(output.content);
  }

  return {};
}

function buildHistoryItem(
  campaign: Campaign,
  output: CampaignOutput,
  platform: SocialPlatform,
  text: string,
  imageUrl: string | null,
): CopyHistoryItem {
  return {
    id: `${campaign.id}:${output.id}:${platform}`,
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    outputId: output.id,
    platform,
    text,
    imageUrl,
    createdAt: output.created_at || campaign.created_at,
  };
}

export function extractCopyFromCampaign(campaign: Campaign): CopyHistoryItem[] {
  const imageUrl = getImageUrlFromCampaign(campaign);
  const items: CopyHistoryItem[] = [];

  for (const output of campaign.outputs) {
    if (output.output_type !== "copy") continue;

    const platforms = extractPlatformsFromOutput(output);
    for (const platform of socialPlatforms) {
      const text = platforms[platform];
      if (!text) continue;
      items.push(buildHistoryItem(campaign, output, platform, text, imageUrl));
    }
  }

  return items;
}

export function listProjectCopyHistory(projectId: string): CopyHistoryItem[] {
  const summaries = listMockCampaignSummaries(projectId);
  const items: CopyHistoryItem[] = [];

  for (const summary of summaries) {
    const campaign = getMockCampaign(summary.id);
    if (!campaign) continue;
    items.push(...extractCopyFromCampaign(campaign));
  }

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function groupCopyHistoryByCampaign(
  items: CopyHistoryItem[],
): Array<{ campaignId: string; campaignTitle: string; items: CopyHistoryItem[] }> {
  const groups = new Map<string, { campaignId: string; campaignTitle: string; items: CopyHistoryItem[] }>();

  for (const item of items) {
    const existing = groups.get(item.campaignId);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(item.campaignId, {
        campaignId: item.campaignId,
        campaignTitle: item.campaignTitle,
        items: [item],
      });
    }
  }

  return Array.from(groups.values());
}
