import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationsService } from './invitations.service';

@ApiTags('Invitations')
@Controller('organizations/invitations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class OrganizationInvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar invitaciones pendientes de mi organización' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.invitationsService.listPending(user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Invitar a alguien a mi organización' })
  @ApiBody({ type: CreateInvitationDto })
  create(
    @Body() body: CreateInvitationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.invitationsService.create(
      user.organizationId,
      user.id,
      body.email,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Revocar una invitación pendiente' })
  revoke(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.invitationsService.revoke(user.organizationId, id);
  }
}

@ApiTags('Invitations')
@Controller('invitations')
export class PublicInvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
    private readonly authService: AuthService,
  ) {}

  @Get(':token')
  @ApiOperation({ summary: 'Consultar una invitación por su token' })
  getByToken(@Param('token') token: string) {
    return this.invitationsService.getByToken(token);
  }

  @Post(':token/accept')
  @ApiOperation({
    summary: 'Aceptar una invitación creando la cuenta e iniciando sesión',
  })
  @ApiBody({ type: AcceptInvitationDto })
  async accept(
    @Param('token') token: string,
    @Body() body: AcceptInvitationDto,
  ) {
    const { email, password } = await this.invitationsService.acceptAndCreateUser(
      token,
      body,
    );

    // Reutiliza el login normal para no duplicar la emisión de tokens.
    return this.authService.login(email, password);
  }
}
