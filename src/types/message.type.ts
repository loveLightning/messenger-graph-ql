export type DeleteMessageTypes = {
  userId: number;
  conversationId: number;
  messageId: number;
};

export type GetConversationMessagesTypes = {
  conversationId: number;
  limit: number;
};

export type FindMessageParams = {
  userId: number;
  conversationId: number;
  messageId: number;
};
