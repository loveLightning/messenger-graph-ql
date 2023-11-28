import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendEntity } from 'src/entities/friend.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendEntity)
    private readonly friendsRepository: Repository<FriendEntity>,
  ) {}

  async getFriends(id: number): Promise<FriendEntity[]> {
    return this.friendsRepository.find({
      where: [{ sender: { id } }, { receiver: { id } }],
      relations: [
        'sender',
        'receiver',
        'sender.profile',
        'receiver.profile',
        'receiver.presence',
        'sender.presence',
      ],
    });
  }

  async findFriendById(id: number): Promise<FriendEntity> {
    return this.friendsRepository.findOne({
      where: { id },
      relations: [
        'sender',
        'receiver',
        'sender.profile',
        // 'sender.presence',
        'receiver.profile',
        // 'receiver.presence',
      ],
    });
  }

  async deleteFriend({ friendId, userId }) {
    const friend = await this.findFriendById(friendId);

    if (!friend) throw new NotFoundException();

    if (friend.receiver.id !== userId && friend.sender.id !== userId)
      throw new HttpException(
        "You don't have permission",
        HttpStatus.FORBIDDEN,
      );

    await this.friendsRepository.delete(friendId);
    return friend;
  }

  async isFriends(userOneId: number, userTwoId: number) {
    return this.friendsRepository.findOne({
      where: [
        {
          sender: { id: userOneId },
          receiver: { id: userTwoId },
        },
        {
          sender: { id: userTwoId },
          receiver: { id: userOneId },
        },
      ],
    });
  }
}
