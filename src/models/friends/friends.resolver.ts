import { Args, Query, Resolver, Mutation, Subscription } from '@nestjs/graphql';
import { UserEntity } from 'src/entities';
import { FriendsService } from './friends.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FriendEntity } from 'src/entities/friend.entity';
import { DeleteFriendInput } from './inputs/delete-friend.input';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { SubscriptionEnum } from 'src/types/subscriptions';

@UseGuards(JwtAuthGuard)
@Resolver()
export class UsersResolver {
  constructor(
    private readonly friendsService: FriendsService,
    private pubSub: PubSubService,
  ) {}

  @Query(() => [FriendEntity])
  async getFriends(@CurrentUser() user: UserEntity): Promise<FriendEntity[]> {
    return this.friendsService.getFriends(user.id);
  }

  @Mutation(() => FriendEntity)
  async deleteFriend(
    @CurrentUser() { id: userId }: UserEntity,
    @Args('input') { friendId }: DeleteFriendInput,
  ): Promise<FriendEntity> {
    const friend = await this.friendsService.deleteFriend({
      friendId,
      userId,
    });

    this.pubSub.publish(SubscriptionEnum.FRIEND_REMOVED, {
      friendRemoved: { friend, userId },
    });

    return friend;
  }

  @Subscription(() => FriendEntity, {
    filter: (payload, _, context) => {
      const currentUserId = context.req.user.id;
      const { receiver, sender } = payload.friendRemoved.friend;

      return receiver.id === currentUserId || sender.id === currentUserId;
    },
  })
  friendRemoved() {
    return this.pubSub.asyncIterator(SubscriptionEnum.FRIEND_REMOVED);
  }
}
