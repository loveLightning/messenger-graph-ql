import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetConversationInput {
  @Field()
  conversationId: number;
}
