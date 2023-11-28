import { UserEntity } from 'src/entities/user.entity';

export interface TokenTypes {
  refreshToken: string;
  accessToken: string;
}

export type TokenTypesWithUser = TokenTypes & UserEntity;
