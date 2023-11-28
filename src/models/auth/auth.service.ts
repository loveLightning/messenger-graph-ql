import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { UserEntity } from 'src/entities/user.entity';
import { TokenEntity } from 'src/entities/token.entity';
import { RegisterInput } from './inputs/register.input';
import { TokenTypes } from 'src/types/token.types';
import { LoginInput } from './inputs/login.input';
import { UsersService } from '../users/users.service';
import { ProfileEntity } from 'src/entities';

@Injectable()
export class AuthService {
  private blacklistedTokens = new Set<number>();

  constructor(
    private jwtService: JwtService,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,
    private usersService: UsersService,
  ) {}

  async register(registerInput: RegisterInput): Promise<TokenTypes> {
    const { email, fullname, password } = registerInput;

    const existingUser = await this.usersService.getUserByEmail(email);
    if (existingUser) {
      throw new NotFoundException('User with this email already exists');
    }

    const hashedPassword = await argon2.hash(password);

    const profile = new ProfileEntity();
    profile.fullname = fullname;
    await this.profileRepository.save(profile);

    const user = new UserEntity();
    user.email = email;
    user.password = hashedPassword;
    user.profile = profile;

    await this.userRepository.save(user);
    const tokens = await this.generateTokens(user);

    return tokens;
  }

  async login(loginInput: LoginInput): Promise<TokenTypes> {
    const { email, password } = loginInput;

    const existUser = await this.usersService.getUserByEmail(email);

    if (!existUser) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const passwordMatch = await argon2.verify(existUser.password, password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(existUser);

    return tokens;
  }

  async refresh(refreshToken: string): Promise<TokenTypes> {
    if (!refreshToken) throw new UnauthorizedException();

    const token = await this.tokenRepository
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: refreshToken })
      .getOne();

    if (
      !token ||
      token.token !== refreshToken ||
      this.blacklistedTokens.has(token.id) ||
      new Date() > token.expires
    ) {
      throw new NotFoundException('Invalid refresh token');
    }

    const user = await this.userRepository.findOne({
      where: {
        id: token.user.id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.tokenRepository.delete(token.id);
    const tokens = await this.generateTokens(user);
    return tokens;
  }

  async revokeRefreshTokensForUser(userId: number): Promise<void> {
    const tokens = await this.tokenRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });

    tokens.forEach((token) => {
      this.blacklistedTokens.add(token.id);
    });

    await this.tokenRepository.delete({
      user: {
        id: userId,
      },
    });
  }

  async generateTokens(user: UserEntity): Promise<TokenTypes> {
    await this.deleteExpiredTokens(user.id);

    const payload = {
      id: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const refreshToken = new TokenEntity();

    refreshToken.token = this.jwtService.sign(
      { id: user.id },
      { expiresIn: '7d' },
    );
    refreshToken.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    refreshToken.user = user;

    await this.tokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async deleteExpiredTokens(userId: number): Promise<void> {
    const currentDate = new Date();
    await this.tokenRepository.delete({
      user: { id: userId },
      expires: LessThanOrEqual(currentDate),
    });
  }
}
