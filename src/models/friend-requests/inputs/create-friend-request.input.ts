import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@ObjectType()
export class CreateFriendRequestInput {
  @Field()
  @IsNotEmpty()
  recipientId: number;
}
