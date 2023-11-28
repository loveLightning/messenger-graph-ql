import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { FriendRequestStatus } from 'src/types/friend.types';
import { Field, ID } from '@nestjs/graphql';

@Index(['sender.id', 'receiver.id'], { unique: true })
@Entity({ name: 'friend_requests' })
export class FriendRequestEntity {
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

  @Field()
  @Column()
  status: FriendRequestStatus;
}
