import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserOnlineInput {
  @Field()
  id: string;

  @Field()
  online: boolean;
}
