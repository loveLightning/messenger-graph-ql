import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Index(['sender.id', 'receiver.id'], { unique: true })
@Entity('friends')
@ObjectType()
export class FriendEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => UserEntity)
  @OneToOne(() => UserEntity, { createForeignKeyConstraints: false })
  @JoinColumn()
  sender: UserEntity;

  @Field(() => UserEntity)
  @OneToOne(() => UserEntity, { createForeignKeyConstraints: false })
  @JoinColumn()
  receiver: UserEntity;

  @Field()
  @CreateDateColumn()
  createdAt: number;
}
