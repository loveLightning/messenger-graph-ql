import { NotFoundException, UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Query, Args, Subscription } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { MessageEntity, UserEntity } from 'src/entities';
import { CreateMessageInput } from './inputs/create-msg-conversation.input';
import { MessageService } from './message.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { SubscriptionEnum } from 'src/types/subscriptions';
import { GetMsgsFromConversationInput } from './inputs/get-msgs-conversation.input';
import { DeleteMsgFromConversationInput } from './inputs/delete-msg-conversation.input';
import { EditMsgFromConversationInput } from './inputs/edit-message-conversation.input';
import { Throttle } from '@nestjs/throttler';

@UseGuards(JwtAuthGuard)
@Resolver()
export class MessageResolver {
  constructor(
    private messageService: MessageService,
    private pubSub: PubSubService,
  ) {}

  @Query(() => [MessageEntity])
  async getMessagesFromConversation(
    @CurrentUser() user: UserEntity,
    @Args('input') input: GetMsgsFromConversationInput,
  ): Promise<MessageEntity[]> {
    const messages = await this.messageService.getMessages(
      user.id,
      input.conversationId,
    );

    return messages;
  }

  @Throttle(5, 10)
  @Mutation(() => MessageEntity)
  async createMessage(
    @CurrentUser() user: UserEntity,
    @Args('input') input: CreateMessageInput,
  ): Promise<MessageEntity> {
    if (!input) throw new NotFoundException('Attachments or text not found');

    const createdMessage = await this.messageService.createMessage(user, input);

    this.pubSub.publish(SubscriptionEnum.MESSAGE_CREATED, {
      messageCreated: createdMessage,
    });

    return createdMessage;
  }

  @Mutation(() => Boolean)
  async deleteMessageFromConversation(
    @CurrentUser() { id: userId }: UserEntity,
    @Args('input') input: DeleteMsgFromConversationInput,
  ) {
    const { conversationId, messageId } = input;

    const deletedMessage = await this.messageService.deleteMessage({
      userId: userId,
      messageId,
      conversationId,
    });

    this.pubSub.publish(SubscriptionEnum.MESSAGE_DELETED, {
      messageDeleted: deletedMessage,
    });
    return true;
  }

  @Mutation(() => MessageEntity)
  async editMessageFromConversation(
    @CurrentUser() user: UserEntity,
    @Args('input') input: EditMsgFromConversationInput,
  ) {
    const editedMessage = await this.messageService.editMessage(user.id, input);

    this.pubSub.publish(SubscriptionEnum.MESSAGE_UPDATED, {
      messageUpdated: editedMessage,
    });
    return editedMessage;
  }

  @Subscription(() => MessageEntity, {
    filter: (payload, _, context) => {
      const currentUserId = context.req.user.id;
      const { creator, recipient } = payload.messageCreated.conversation;

      return creator.id === currentUserId || recipient.id === currentUserId;
    },
  })
  createdDeleted() {
    return this.pubSub.asyncIterator(SubscriptionEnum.MESSAGE_CREATED);
  }

  @Subscription(() => MessageEntity, {
    filter: async (payload, _, context) => {
      const currentUserId = context.req.user.id;
      const { creator, recipient } = payload.messageDeleted.conversation;

      return creator.id === currentUserId || recipient.id === currentUserId;
    },
  })
  messageDeleted() {
    return this.pubSub.asyncIterator(SubscriptionEnum.MESSAGE_DELETED);
  }

  @Subscription(() => MessageEntity, {
    filter: (payload, _, context) => {
      const currentUserId = context.req.user.id;
      const { creator, recipient } = payload.messageUpdated.conversation;

      return creator.id === currentUserId || recipient.id === currentUserId;
    },
  })
  messageUpdated() {
    return this.pubSub.asyncIterator(SubscriptionEnum.MESSAGE_UPDATED);
  }
}
