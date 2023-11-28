import { Query, Resolver } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Inject } from '@nestjs/common';

@Resolver('Chat')
export class ChatResolver {
  constructor(@Inject(ChatService) private chatService: ChatService) {}

  @Query(() => String)
  async getChatById(): Promise<string> {
    return 'Hello';
  }
}
