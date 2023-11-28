import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Subscription, Query } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConversationService } from './conversation.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ConversationEntity, UserEntity } from 'src/entities';
import { CreateConversationInput } from './inputs/create-conversation.input';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { SubscriptionEnum } from 'src/types/subscriptions';
import { GetConversationInput } from './inputs/get-conversation';

@UseGuards(JwtAuthGuard)
@Resolver()
export class ConversationResolver {
  constructor(
    private conversationService: ConversationService,
    private pubSub: PubSubService,
  ) {}

  @Query(() => ConversationEntity)
  async getConversationById(
    @Args('input') input: GetConversationInput,
    @CurrentUser() user: UserEntity,
  ) {
    return this.conversationService.getConversationById(
      +input.conversationId,
      user.id,
    );
  }

  @Query(() => [ConversationEntity])
  async getConversations(
    @CurrentUser() user: UserEntity,
  ): Promise<ConversationEntity[]> {
    return this.conversationService.getConversations(user.id);
  }

  @Mutation(() => ConversationEntity)
  async createConversation(
    @CurrentUser() user: UserEntity,
    @Args('input') input: CreateConversationInput,
  ): Promise<ConversationEntity> {
    const conversation = await this.conversationService.createConversation(
      user,
      input,
    );

    this.pubSub.publish(SubscriptionEnum.CONVERSATION_CREATED, {
      conversationCreated: conversation,
    });

    return conversation;
  }

  @Subscription(() => ConversationEntity, {
    filter: (payload, _, context) => {
      const currentUserId = context.req.user.id;

      return (
        payload.conversationCreated.creator.id === currentUserId ||
        payload.conversationCreated.recipient.id === currentUserId
      );
    },
  })
  conversationCreated() {
    return this.pubSub.asyncIterator(SubscriptionEnum.CONVERSATION_CREATED);
  }
}
