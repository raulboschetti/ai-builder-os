import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientService } from './client.service';

@ApiTags('Client')
@Controller('client')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('project')
  @ApiOperation({ summary: 'El único proyecto al que tiene acceso este cliente' })
  getMyProject(@CurrentUser() user: AuthenticatedUser) {
    return this.clientService.getMyProject(user.role, user.clientProjectId);
  }

  @Get('analysis')
  @ApiOperation({ summary: 'Análisis de viabilidad de su proyecto (solo lectura)' })
  getMyAnalysis(@CurrentUser() user: AuthenticatedUser) {
    return this.clientService.getMyAnalysis(user.role, user.clientProjectId);
  }
}
