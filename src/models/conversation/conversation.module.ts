import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationEntity, MessageEntity, UserEntity } from 'src/entities';
import { ConversationResolver } from './conversation.resolver';
import { ConversationService } from './conversation.service';
import { UsersService } from '../users/users.service';
import { PubSubService } from 'src/pubsub/pubsub.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity, ConversationEntity, UserEntity]),
  ],
  providers: [
    ConversationResolver,
    ConversationService,
    UsersService,
    PubSubService,
  ],
  exports: [ConversationService],
})
export class ConversationModule {}
