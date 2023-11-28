import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateConversationInput {
  @Field()
  idRecipient: number;

  @Field()
  @IsString()
  message: string;
}
