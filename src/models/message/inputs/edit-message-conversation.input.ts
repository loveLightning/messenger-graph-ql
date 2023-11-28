import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { FileUpload } from 'graphql-upload';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

@InputType()
export class EditMsgFromConversationInput {
  @Field()
  conversationId: number;

  @Field()
  messageId: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;

  @Field(() => GraphQLUpload, { nullable: true })
  attachment?: Promise<FileUpload>;

  @Field({ nullable: true })
  attachmentId?: number;
}
