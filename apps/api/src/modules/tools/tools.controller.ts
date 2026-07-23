import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerateRoadmapDto } from './dto/generate-roadmap.dto';
import { ToolsService } from './tools.service';

/**
 * Requiere cuenta (JwtAuthGuard) — decisión explícita de Raúl: nada de
 * herramientas de IA abiertas al público sin registrarse, para no regalar
 * el valor a quien no va a pagar ni copiar la idea sin más. Se mantiene
 * el límite de peticiones igualmente, como segunda capa de protección
 * frente al coste real de cada llamada a la IA.
 */
@ApiTags('Tools')
@Controller('tools')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post('roadmap')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Generar (y guardar) un roadmap de lanzamiento' })
  @ApiBody({ type: GenerateRoadmapDto })
  generateRoadmap(
    @Body() body: GenerateRoadmapDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.toolsService.generateRoadmap(
      user.id,
      body.businessVertical ?? null,
      body.description,
    );
  }

  @Get('roadmap')
  @ApiOperation({ summary: 'Obtener el último roadmap generado por este usuario' })
  getLatestRoadmap(@CurrentUser() user: AuthenticatedUser) {
    return this.toolsService.getLatestRoadmap(user.id);
  }
}
