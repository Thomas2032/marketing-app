export const socialPlatforms = ["LinkedIn", "X", "Instagram", "Facebook"] as const;
export type SocialPlatform = (typeof socialPlatforms)[number];

export type CopyHistoryItem = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  outputId: string;
  platform: SocialPlatform;
  text: string;
  imageUrl: string | null;
  createdAt: string;
};

export type PublishQueueItemStatus = "draft" | "scheduled" | "published" | "failed";

export type PublishQueueItem = CopyHistoryItem & {
  scheduledAt: string | null;
  status: PublishQueueItemStatus;
};

export type PublishBatch = {
  id: string;
  projectId: string;
  items: PublishQueueItem[];
  createdAt: string;
};
