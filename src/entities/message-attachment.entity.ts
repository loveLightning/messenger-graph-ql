import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MessageEntity } from './message.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity('message_attachments')
@ObjectType()
export class MessageAttachmentEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  fullpath: string;

  @Field(() => MessageEntity, { nullable: true })
  @ManyToOne(() => MessageEntity, (message) => message.attachments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  message: MessageEntity;
}
