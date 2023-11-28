import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class ConversationGuard implements CanActivate {
  constructor(private conversationService: ConversationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const conversationId = ctx.getArgs().id;
    const userId = ctx.getContext().req.user.id;

    const conversation = await this.conversationService.getConversationById(
      conversationId,
      userId,
    );

    if (conversation) {
      return true;
    }
  }
}
