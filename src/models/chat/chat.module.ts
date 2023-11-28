import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatResolver } from './chat.resolver';
import { ChatService } from './chat.service';
import { MessageEntity } from 'src/entities/message.entity';
import { UserEntity } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity, UserEntity])],
  providers: [ChatResolver, ChatService],
})
export class ChatModule {}
