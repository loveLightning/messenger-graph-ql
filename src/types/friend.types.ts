import { UserEntity } from 'src/entities';

export type FriendRequestStatus = 'accepted' | 'pending' | 'rejected';

export type CreateFriendParams = {
  user: UserEntity;
  recipientId: number;
};

export type FriendRequestParams = {
  id: number;
  userId: number;
};
