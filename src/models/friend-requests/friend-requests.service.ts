import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FriendsService } from '../friends/friends.service';
import { UsersService } from '../users/users.service';
import { FriendRequestEntity } from 'src/entities/friend-request.entity';
import { FriendEntity } from 'src/entities';
import {
  CreateFriendParams,
  FriendRequestParams,
} from 'src/types/friend.types';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendEntity)
    private readonly friendRepository: Repository<FriendEntity>,
    @InjectRepository(FriendRequestEntity)
    private readonly friendRequestRepository: Repository<FriendRequestEntity>,
    private readonly userService: UsersService,
    private readonly friendsService: FriendsService,
  ) {}

  getFriendRequests(id: number): Promise<FriendRequestEntity[]> {
    const status = 'pending';
    return this.friendRequestRepository.find({
      where: [
        { sender: { id }, status },
        { receiver: { id }, status },
      ],
      relations: ['receiver', 'sender', 'receiver.profile', 'sender.profile'],
    });
  }

  async cancel({ id, userId }: FriendRequestParams) {
    const friendRequest = await this.findById(id);

    if (!friendRequest) throw new NotFoundException('Friend request not found');

    if (friendRequest.sender.id !== userId)
      throw new HttpException(
        'SenderId not have to equal userId',
        HttpStatus.CONFLICT,
      );

    await this.friendRequestRepository.delete(id);
    return friendRequest;
  }

  async create({ user: sender, recipientId }: CreateFriendParams) {
    const receiver = await this.userService.getUserById(recipientId);

    if (!receiver) throw new NotFoundException();

    const exists = await this.isPending(sender.id, receiver.id);

    if (exists) throw new NotFoundException('Friend request not found');

    if (receiver.id === sender.id)
      throw new HttpException(
        'Recipient and creator cannot be the same',
        HttpStatus.CONFLICT,
      );

    const isFriends = await this.friendsService.isFriends(
      sender.id,
      receiver.id,
    );

    if (isFriends)
      throw new HttpException('You are already friends ', HttpStatus.CONFLICT);

    const friend = this.friendRequestRepository.create({
      sender,
      receiver,
      status: 'pending',
    });

    return this.friendRequestRepository.save(friend);
  }

  async accept({ id, userId }: FriendRequestParams) {
    const friendRequest = await this.findById(id);

    if (!friendRequest) throw new NotFoundException('Friend request not found');

    if (friendRequest.status === 'accepted')
      throw new HttpException(
        'The user has already accepted the request',
        HttpStatus.CONFLICT,
      );

    if (friendRequest.receiver.id !== userId)
      throw new HttpException(
        'You can not be the recipient',
        HttpStatus.CONFLICT,
      );

    friendRequest.status = 'accepted';

    const updatedFriendRequest = await this.friendRequestRepository.save(
      friendRequest,
    );
    const newFriend = this.friendRepository.create({
      sender: friendRequest.sender,
      receiver: friendRequest.receiver,
    });

    const friend = await this.friendRepository.save(newFriend);

    return { friend, friendRequest: updatedFriendRequest };
  }

  async reject({ id, userId }: FriendRequestParams) {
    const friendRequest = await this.findById(id);

    if (!friendRequest) throw new NotFoundException('');

    if (friendRequest.status === 'accepted')
      throw new HttpException(
        'The user has already accepted the request',
        HttpStatus.CONFLICT,
      );

    if (friendRequest.receiver.id !== userId)
      throw new HttpException(
        'You can not be the recipient',
        HttpStatus.CONFLICT,
      );

    friendRequest.status = 'rejected';

    return this.friendRequestRepository.save(friendRequest);
  }

  isPending(userOneId: number, userTwoId: number) {
    return this.friendRequestRepository.findOne({
      where: [
        {
          sender: { id: userOneId },
          receiver: { id: userTwoId },
          status: 'pending',
        },
        {
          sender: { id: userTwoId },
          receiver: { id: userOneId },
          status: 'pending',
        },
      ],
    });
  }

  findById(id: number): Promise<FriendRequestEntity> {
    return this.friendRequestRepository.findOne({
      where: { id },
      relations: ['receiver', 'sender'],
    });
  }
}
