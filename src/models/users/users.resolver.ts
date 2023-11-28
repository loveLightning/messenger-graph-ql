import { Args, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserEntity } from 'src/entities';
import { HttpException, HttpStatus } from '@nestjs/common';

@Resolver()
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Query(() => [UserEntity])
  async searchUsers(@Args('query') query: string) {
    if (!query)
      throw new HttpException('Provide a valid query', HttpStatus.BAD_REQUEST);

    this.userService.searchUsers(query);
  }
}
