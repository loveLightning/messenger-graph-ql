import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserEntity } from './user.entity';
import { GroupEntity } from './group.entity';
import { MessageAttachmentEntity } from './message-attachment.entity';

@Entity('group_messages')
@ObjectType()
export class GroupMessageEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'text', nullable: true })
  content: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: number;

  @Field(() => UserEntity)
  @ManyToOne(() => UserEntity, (user) => user.messages)
  author: UserEntity;

  @Field(() => GroupEntity)
  @ManyToOne(() => GroupEntity, (group) => group.messages)
  group: GroupEntity;

  @Field(() => [MessageAttachmentEntity])
  @OneToMany(() => MessageAttachmentEntity, (attachment) => attachment.message)
  @JoinColumn()
  attachments?: MessageAttachmentEntity[];
}
