import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SkipTenant } from '../common/decorators/skip-tenant.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginCamaraDto } from './dto/login-camara.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@SkipTenant()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login-camara')
  loginCamara(@Body() dto: LoginCamaraDto) {
    return this.authService.loginCamara(dto);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@Req() req: { user: AuthenticatedUser }) {
    return this.authService.me(req.user);
  }
}
