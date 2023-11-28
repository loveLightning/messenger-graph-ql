import { Field, InputType } from '@nestjs/graphql';
import { FileUpload } from 'graphql-upload';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

@InputType()
export class CreateMessageInput {
  @Field({ nullable: true })
  content: string;

  @Field()
  conversationId: number;

  @Field(() => [GraphQLUpload], { nullable: true })
  attachments?: Promise<FileUpload[]>;
}
