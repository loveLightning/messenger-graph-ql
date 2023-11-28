import { Resolver, Mutation, Args, Context } from '@nestjs/graphql'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { RegisterInput } from './inputs/register.input'
import { ReturnAuthModel } from './models/auth.model'
import { LoginInput } from './inputs/login.input'
import { setCookie } from 'src/common/utils/set-cookie'
import { UseGuards } from '@nestjs/common'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from './jwt-auth.guard'
import { UserEntity } from 'src/entities'

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => ReturnAuthModel)
  async register(
    @Args('registerInput') registerInput: RegisterInput,
    @Context('res') res: Response,
  ): Promise<ReturnAuthModel> {
    const { accessToken, refreshToken } = await this.authService.register(
      registerInput,
    )

    setCookie(res, refreshToken)

    return { accessToken }
  }

  @Mutation(() => ReturnAuthModel)
  async login(
    @Args('loginInput') loginInput: LoginInput,
    @Context('res') res: Response,
  ): Promise<ReturnAuthModel> {
    const { accessToken, refreshToken } = await this.authService.login(
      loginInput,
    )

    setCookie(res, refreshToken)

    return { accessToken }
  }

  @Mutation(() => ReturnAuthModel)
  async refresh(
    @Context('res') res: Response,
    @Context('req') req: Request,
  ): Promise<ReturnAuthModel> {
    const refreshToken = req.cookies['refreshToken']
    console.log(refreshToken, ' token')

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken)

    setCookie(res, newRefreshToken)

    return { accessToken }
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Context('res') res: Response,
    @CurrentUser() user: UserEntity,
  ): Promise<boolean> {
    await this.authService.revokeRefreshTokensForUser(user.id)

    res.clearCookie('refreshToken')
    res.clearCookie('accessToken')

    return true
  }
}
