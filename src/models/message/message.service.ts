import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from 'src/entities/message.entity';
import { Repository } from 'typeorm';
import { CreateMessageInput } from './inputs/create-msg-conversation.input';
import {
  ConversationEntity,
  MessageAttachmentEntity,
  UserEntity,
} from 'src/entities';
import { ConversationService } from '../conversation/conversation.service';
import { instanceToPlain } from 'class-transformer';
import { MessageAttachmentsService } from '../message-attachments/message-attachments.service';
import { buildFindMessageParams } from 'src/common/helpers/params';
import { DeleteMessageTypes } from 'src/types/message.type';
import { EditMsgFromConversationInput } from './inputs/edit-message-conversation.input';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(MessageAttachmentEntity)
    private readonly attachmentRepository: Repository<MessageAttachmentEntity>,
    private conversationService: ConversationService,
    private messageAttachmentsService: MessageAttachmentsService,
  ) {}

  async createMessage(user: UserEntity, input: CreateMessageInput) {
    const { content, conversationId, attachments } = input;

    const conversation = await this.conversationService.getConversationById(
      conversationId,
      user.id,
    );

    if (!conversation) throw new NotFoundException('Conversation not found');

    const message = this.messageRepository.create({
      content,
      conversation,
      author: instanceToPlain(user),
      attachments: attachments
        ? await this.messageAttachmentsService.create(attachments)
        : [],
    });
    const savedMessage = await this.messageRepository.save(message);
    conversation.lastMessageSent = savedMessage;

    await this.conversationRepository.save(conversation);

    return savedMessage;
  }

  async getMessages(
    userId: number,
    conversationId: number,
  ): Promise<MessageEntity[]> {
    await this.conversationService.getConversationById(conversationId, userId);

    return this.messageRepository.find({
      relations: ['author', 'author.profile', 'attachments'],
      where: {
        conversation: {
          id: conversationId,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteMessage({
    userId,
    messageId,
    conversationId,
  }: DeleteMessageTypes): Promise<MessageEntity> {
    const msgParams = { limit: 5, conversationId };
    const conversationMessages = await this.conversationService.getMessages(
      msgParams,
    );

    if (!conversationMessages)
      throw new NotFoundException('Conversation not found');

    const findMsgParams = buildFindMessageParams({
      conversationId,
      messageId,
      userId, // if you want delete a message another person you have to uncomment this line.
    });

    const message = await this.messageRepository.findOne({
      where: findMsgParams,
      relations: [
        'conversation',
        'conversation.creator',
        'conversation.recipient',
      ],
    });

    if (!message)
      throw new NotFoundException(
        'The author of the message was not found or meesage not found',
      );

    if (message.id !== conversationMessages.lastMessageSent.id) {
      await this.messageRepository.delete({ id: message.id });
      return message;
    }

    await this.deleteLastMessage(conversationMessages, message);
    return message;
  }

  async deleteLastMessage(
    conversation: ConversationEntity,
    message: MessageEntity,
  ) {
    const size = conversation.messages.length;
    const SECOND_MESSAGE_INDEX = 1; // the penultimate index in messages

    if (size <= 1) {
      //if we have only one message
      await this.conversationRepository.update(conversation.id, {
        lastMessageSent: null,
      });

      return this.messageRepository.delete({ id: message.id });
    } else {
      //if we have more one than message
      const newLastMessage = conversation.messages[SECOND_MESSAGE_INDEX];

      await this.conversationRepository.update(conversation.id, {
        lastMessageSent: newLastMessage,
      });

      return this.messageRepository.delete({ id: message.id });
    }
  }

  async editMessage(userId: number, input: EditMsgFromConversationInput) {
    const { content, conversationId, messageId, attachment, attachmentId } =
      input;

    const findMsgParams = buildFindMessageParams({
      conversationId,
      messageId,
      userId,
    });

    const editedMessage = await this.messageRepository.findOne({
      where: findMsgParams,
      relations: [
        'conversation',
        'conversation.creator',
        'conversation.recipient',
        'author',
        'author.profile',
      ],
    });

    if (!editedMessage) throw new ForbiddenException('Cannot Edit Message');

    if (attachment && attachmentId) {
      await this.messageAttachmentsService.update(attachment, attachmentId);
    }

    editedMessage.content = content;
    return this.messageRepository.save(editedMessage);
  }
}
