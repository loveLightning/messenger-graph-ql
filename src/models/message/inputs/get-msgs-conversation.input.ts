import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetMsgsFromConversationInput {
  @Field()
  conversationId: number;
}
