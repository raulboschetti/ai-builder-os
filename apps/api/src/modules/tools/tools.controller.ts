import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from '../ai/ai.service';
import { GenerateRoadmapDto } from './dto/generate-roadmap.dto';

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
  constructor(private readonly aiService: AiService) {}

  @Post('roadmap')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Generar un roadmap de 90 días' })
  @ApiBody({ type: GenerateRoadmapDto })
  generateRoadmap(@Body() body: GenerateRoadmapDto) {
    return this.aiService.generateRoadmap(
      body.businessVertical ?? null,
      body.description,
    );
  }
}
