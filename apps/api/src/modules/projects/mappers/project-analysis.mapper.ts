import { ProjectAnalysis } from '@prisma/client';

export class ProjectAnalysisMapper {
  static toResponse(analysis: ProjectAnalysis) {
    return {
      id: analysis.id,
      viability: analysis.viability,
      summary: analysis.summary,
      keyFeatures: analysis.keyFeatures,
      risks: analysis.risks,
      createdAt: analysis.createdAt,
    };
  }
}
