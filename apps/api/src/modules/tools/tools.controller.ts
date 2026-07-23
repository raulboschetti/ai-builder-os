import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AiService } from '../ai/ai.service';
import { GenerateRoadmapDto } from './dto/generate-roadmap.dto';

/**
 * Endpoints públicos (sin login) usados como imanes de captación en
 * marketing. Sin JwtAuthGuard a propósito — pero por eso mismo van con
 * @Throttle: cada llamada cuesta dinero real de la API de Claude, y sin
 * límite cualquiera podría darle sin parar y disparar el gasto.
 */
@ApiTags('Tools (público)')
@Controller('tools')
export class ToolsController {
  constructor(private readonly aiService: AiService) {}

  @Post('roadmap')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Generar un roadmap de 90 días (herramienta pública)' })
  @ApiBody({ type: GenerateRoadmapDto })
  generateRoadmap(@Body() body: GenerateRoadmapDto) {
    return this.aiService.generateRoadmap(
      body.businessVertical ?? null,
      body.description,
    );
  }
}
