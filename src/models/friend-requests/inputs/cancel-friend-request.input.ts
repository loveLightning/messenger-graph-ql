import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CancelFriendRequestInput {
  @Field()
  id: number;
}
