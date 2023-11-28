import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ReturnAuthModel {
  @Field()
  accessToken: string;
}
