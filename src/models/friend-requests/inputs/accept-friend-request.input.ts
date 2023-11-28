import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AcceptFriendRequestInput {
  @Field()
  id: number;
}
