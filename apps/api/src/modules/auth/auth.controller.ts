import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Cambiar un refresh token por un par de tokens nuevo' })
  @ApiBody({ type: RefreshTokenDto })
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Usuario y organización activa de la sesión actual',
  })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getCurrentUser(user.id, user.organizationId);
  }
}