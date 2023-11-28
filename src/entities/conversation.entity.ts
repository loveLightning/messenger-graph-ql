import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { MessageEntity } from './message.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity('conversations')
@Index(['creator.id', 'recipient.id'], { unique: true })
@ObjectType()
export class ConversationEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: number;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  lastMessageSentAt: Date;

  @Field(() => UserEntity)
  @OneToOne(() => UserEntity, { createForeignKeyConstraints: false })
  @JoinColumn()
  creator: UserEntity;

  @Field(() => UserEntity)
  @OneToOne(() => UserEntity, { createForeignKeyConstraints: false })
  @JoinColumn()
  recipient: UserEntity;

  @Field(() => MessageEntity, { nullable: true })
  @OneToOne(() => MessageEntity, { nullable: true })
  @JoinColumn({ name: 'last_message_sent' })
  lastMessageSent: MessageEntity;

  @OneToMany(() => MessageEntity, (message) => message.conversation, {
    cascade: ['insert', 'remove', 'update'],
  })
  @JoinColumn()
  messages: MessageEntity[];
}
