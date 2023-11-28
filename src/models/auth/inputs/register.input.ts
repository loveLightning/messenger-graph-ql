import { Field, InputType } from '@nestjs/graphql';
import { MinLength } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  fullname: string;

  @Field()
  @MinLength(8)
  password: string;
}
