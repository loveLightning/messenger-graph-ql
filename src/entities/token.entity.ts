import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('tokens')
@ObjectType()
export class TokenEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  token: string;

  @Field()
  @Column({ type: 'timestamp' })
  expires: Date;

  @Field(() => UserEntity)
  @ManyToOne(() => UserEntity, (user) => user.refreshTokens)
  user: UserEntity;
}
