import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from 'src/entities/message.entity';
import { Repository } from 'typeorm';
import { ConversationEntity, UserEntity } from 'src/entities';
import { CreateConversationInput } from './inputs/create-conversation.input';
import { UsersService } from '../users/users.service';
import { GetConversationMessagesTypes } from 'src/types/message.type';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
    private usersService: UsersService,
  ) {}

  async getConversationById(conversationId: number, userId: number) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: [
        'creator',
        'recipient',
        'creator.profile',
        'recipient.profile',
        'lastMessageSent',
      ],
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    if (
      userId === conversation.creator.id ||
      userId === conversation.recipient.id
    ) {
      return conversation;
    } else {
      throw new ForbiddenException();
    }
  }

  async getConversations(userId: number): Promise<ConversationEntity[]> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.creator', 'creator')
      .leftJoinAndSelect('conversation.recipient', 'recipient')
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('creator.profile', 'creatorProfile')
      .leftJoinAndSelect('recipient.profile', 'recipientProfile')
      .where('creator.id = :userId', { userId })
      .orWhere('recipient.id = :userId', { userId })
      .orderBy('conversation.lastMessageSentAt', 'DESC')
      .getMany();
  }

  async createConversation(
    creator: UserEntity,
    input: CreateConversationInput,
  ): Promise<ConversationEntity> {
    const { idRecipient } = input;
    const recipient = await this.usersService.getUserById(idRecipient);

    if (!recipient) throw new NotFoundException('Recipient not found');

    if (recipient.id === creator.id)
      throw new HttpException(
        'Recipient and creator cannot be the same',
        HttpStatus.UNAUTHORIZED,
      );

    const exists = await this.isCreated(creator.id, recipient.id);
    if (exists) throw new HttpException('Conversation already exists', 402);

    const newConversation = this.conversationRepository.create({
      creator,
      recipient,
    });

    const saveConversation = await this.conversationRepository.save(
      newConversation,
    );

    return saveConversation;
  }

  async getMessages({
    conversationId,
    limit,
  }: GetConversationMessagesTypes): Promise<ConversationEntity> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .where('id = :conversationId', { conversationId })
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('conversation.id = :conversationId', { conversationId })
      .orderBy('message.createdAt', 'DESC')
      .limit(limit)
      .getOne();
  }

  private async isCreated(creatorId: number, recipientId: number) {
    return this.conversationRepository.findOne({
      where: [
        {
          creator: { id: creatorId },
          recipient: { id: recipientId },
        },
        {
          creator: { id: recipientId },
          recipient: { id: creatorId },
        },
      ],
    });
  }
}
