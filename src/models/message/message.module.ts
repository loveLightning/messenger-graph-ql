import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';
import { ConversationService } from '../conversation/conversation.service';
import {
  ConversationEntity,
  MessageAttachmentEntity,
  MessageEntity,
  UserEntity,
} from 'src/entities';
import { UsersService } from '../users/users.service';
import { UploadService } from '../upload/upload.service';
import { MessageAttachmentsService } from '../message-attachments/message-attachments.service';
import { PubSubService } from 'src/pubsub/pubsub.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageEntity,
      UserEntity,
      ConversationEntity,
      MessageAttachmentEntity,
    ]),
  ],
  providers: [
    MessageResolver,
    MessageService,
    ConversationService,
    UsersService,
    UploadService,
    MessageAttachmentsService,
    PubSubService,
  ],
  exports: [MessageService],
})
export class MessageModule {}
