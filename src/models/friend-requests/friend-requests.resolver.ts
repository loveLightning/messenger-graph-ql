import { Throttle } from '@nestjs/throttler';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { FriendRequestService } from './friend-requests.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from 'src/entities';
import { FriendRequestEntity } from 'src/entities/friend-request.entity';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { SubscriptionEnum } from 'src/types/subscriptions';
import { AcceptFriendRequestInput } from './inputs/accept-friend-request.input';
import { CancelFriendRequestInput } from './inputs/cancel-friend-request.input';
import { RejectFriendRequestInput } from './inputs/reject-friend-request.input';
import { CreateFriendRequestInput } from './inputs/create-friend-request.input';

@Resolver()
export class FriendRequestResolver {
  constructor(
    private readonly friendRequestService: FriendRequestService,
    private readonly pubSub: PubSubService,
  ) {}

  @Query()
  getFriendRequests(@CurrentUser() user: UserEntity) {
    return this.friendRequestService.getFriendRequests(user.id);
  }

  @Throttle(3, 10)
  @Mutation()
  async createFriendRequest(
    @CurrentUser() user: UserEntity,
    @Args() { recipientId }: CreateFriendRequestInput,
  ) {
    const params = { user, recipientId };
    const friendRequest = await this.friendRequestService.create(params);

    this.pubSub.publish(SubscriptionEnum.FRIEND_REQUEST_CREATED, {
      friendRequestCreated: friendRequest,
    });

    return friendRequest;
  }

  @Throttle(3, 10)
  @Mutation()
  async acceptFriendRequest(
    @CurrentUser() { id: userId }: UserEntity,
    @Args('input') { id }: AcceptFriendRequestInput,
  ) {
    const response = await this.friendRequestService.accept({ id, userId });

    this.pubSub.publish(SubscriptionEnum.FRIEND_REQUEST_ACCEPTED, {
      friendRequestAccepted: response,
    });

    return response;
  }

  @Throttle(3, 10)
  @Mutation()
  async cancelFriendRequest(
    @CurrentUser() { id: userId }: UserEntity,
    @Args('input') { id }: CancelFriendRequestInput,
  ) {
    const response = await this.friendRequestService.cancel({ id, userId });

    this.pubSub.publish(SubscriptionEnum.FRIEND_REQUEST_CANCEL, {
      friendRequestCancel: response,
    });
    return response;
  }

  @Throttle(3, 10)
  @Mutation()
  async rejectFriendRequest(
    @CurrentUser() { id: userId }: UserEntity,
    @Args('input') { id }: RejectFriendRequestInput,
  ) {
    const response = await this.friendRequestService.reject({ id, userId });

    this.pubSub.publish(SubscriptionEnum.FRIEND_REQUEST_REJECTED, {
      friendRequestRejected: response,
    });

    return response;
  }

  @Subscription(() => FriendRequestEntity, {
    filter: (payload, _, context) => {
      const currentUserId = context.req.user.id;
      const receiverId = payload.friendRequestAccepted.receiver.id;

      return receiverId === currentUserId;
    },
  })
  friendRequestCeated() {
    return this.pubSub.asyncIterator(SubscriptionEnum.FRIEND_REQUEST_CREATED);
  }

  @Subscription(() => FriendRequestEntity, {
    filter: (payload, _, context) => {
      const currentUserId = context.req.user.id;
      const receiverId = payload.friendRequestCancel.receiver.id;

      return receiverId === currentUserId;
    },
  })
  friendRequestCancel() {
    return this.pubSub.asyncIterator(SubscriptionEnum.FRIEND_REQUEST_CANCEL);
  }

  @Subscription(() => FriendRequestEntity, {
    filter: (payload, _, context) => {
      const currentUserId = context.req.user.id;
      const senderId = payload.friendRequestAccepted.friendRequest.sender.id;

      return senderId === currentUserId;
    },
  })
  friendRequestAccepted() {
    return this.pubSub.asyncIterator(SubscriptionEnum.FRIEND_REQUEST_ACCEPTED);
  }

  @Subscription(() => FriendRequestEntity, {
    filter: (payload, _, context) => {
      const currentUserId = context.req.user.id;
      const senderId = payload.friendRequestRejected.sender.id;

      return senderId === currentUserId;
    },
  })
  friendRequestRejected() {
    return this.pubSub.asyncIterator(SubscriptionEnum.FRIEND_REQUEST_REJECTED);
  }
}
