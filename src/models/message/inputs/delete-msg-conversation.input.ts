import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteMsgFromConversationInput {
  @Field()
  conversationId: number;

  @Field()
  messageId: number;
}
