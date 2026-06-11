import type { Campaign } from "@/types/campaign";
import { getCampaignMessages } from "@/lib/campaign-state";
import { UserMessage } from "@/components/features/campaign/ConversationMessages";

type ConversationThreadProps = {
  campaign: Campaign;
};

export function ConversationThread({ campaign }: ConversationThreadProps) {
  const messages = getCampaignMessages(campaign);

  if (messages.length > 0) {
    return (
      <div className="flex flex-col gap-6">
        {messages.map((message, index) =>
          message.role === "user" ? (
            <UserMessage key={`${message.created_at}-${index}`}>{message.content}</UserMessage>
          ) : null,
        )}
      </div>
    );
  }

  return <UserMessage>{campaign.brief}</UserMessage>;
}
