import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { AiService, RoadmapResult } from '../ai/ai.service';

@Injectable()
export class ToolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async generateRoadmap(
    userId: string,
    businessVertical: string | null,
    description: string,
  ): Promise<RoadmapResult> {
    const result = await this.aiService.generateRoadmap(
      businessVertical,
      description,
    );

    await this.prisma.roadmap.create({
      data: {
        userId,
        businessVertical,
        description,
        phases: result.phases as unknown as object,
      },
    });

    return result;
  }

  /** El último roadmap que se generó este usuario, o null si nunca ha creado uno. */
  async getLatestRoadmap(userId: string) {
    const roadmap = await this.prisma.roadmap.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!roadmap) {
      return null;
    }

    return {
      businessVertical: roadmap.businessVertical,
      description: roadmap.description,
      phases: roadmap.phases,
      createdAt: roadmap.createdAt,
    };
  }
}
