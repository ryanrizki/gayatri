import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { AdminAuthService } from './auth.service'
import { AdminLogin } from '@gayatri/types'
import { ZodValidationPipe } from '../common/zod-validation.pipe'
import { AdminAuthGuard } from './auth.guard'

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private auth: AdminAuthService) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ login: { limit: 5, ttl: 60_000 } })
  async login(
    @Body(new ZodValidationPipe(AdminLogin)) body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.auth.login(body.email, body.password)
    const isProd = process.env.NODE_ENV === 'production'
    res.cookie('gayatri_admin', result.token, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      maxAge: 8 * 60 * 60 * 1000,
      path: '/'
    })
    return result
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('gayatri_admin')
    return { ok: true }
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  me(@Req() req: Request & { admin?: unknown }) {
    return req.admin
  }
}
