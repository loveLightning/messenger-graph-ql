import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteFriendInput {
  @Field()
  friendId: number;
}
