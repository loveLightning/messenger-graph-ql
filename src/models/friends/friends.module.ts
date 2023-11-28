import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendEntity, UserEntity } from 'src/entities';
import { UsersService } from '../users/users.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { FriendsService } from './friends.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FriendEntity])],
  providers: [UsersService, PubSubService],
  exports: [FriendsService],
})
export class FriendsModule {}
