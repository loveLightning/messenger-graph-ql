import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsModule } from '../friends/friends.module';
import { UsersModule } from '../users/users.module';
import { FriendRequestResolver } from './friend-requests.resolver';
import { FriendEntity } from 'src/entities';
import { FriendRequestEntity } from 'src/entities/friend-request.entity';
import { FriendsService } from '../friends/friends.service';
import { FriendRequestService } from './friend-requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendEntity, FriendRequestEntity]),
    UsersModule,
    FriendsModule,
  ],
  providers: [FriendRequestResolver, FriendRequestResolver, FriendsService],
  exports: [FriendRequestService],
})
export class FriendRequestsModule {}
