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
import { ConversationEntity } from './conversation.entity';
import { MessageAttachmentEntity } from './message-attachment.entity';

@Entity('messages')
@ObjectType()
export class MessageEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  content: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: number;

  @Field(() => UserEntity, { nullable: true })
  @ManyToOne(() => UserEntity, (user) => user.messages, { nullable: true })
  author: UserEntity;

  @Field(() => ConversationEntity, { nullable: true })
  @ManyToOne(
    () => ConversationEntity,
    (conversation) => conversation.messages,
    { nullable: true },
  )
  conversation: ConversationEntity;

  @Field(() => [MessageAttachmentEntity], { nullable: true })
  @OneToMany(
    () => MessageAttachmentEntity,
    (attachment) => attachment.message,
    { nullable: true, onUpdate: 'CASCADE' },
  )
  @JoinColumn()
  attachments: MessageAttachmentEntity[];
}
