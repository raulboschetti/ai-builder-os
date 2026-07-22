import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { ProjectAnalysisMapper } from '../projects/mappers/project-analysis.mapper';
import { ProjectMapper } from '../projects/mappers/project.mapper';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Único punto de entrada para un usuario con rol CLIENT. Nunca acepta
   * un projectId por parámetro — siempre usa el que viene grabado en su
   * propio JWT (clientProjectId), así es estructuralmente imposible que
   * pida el proyecto de otro cliente cambiando un id en la URL.
   */
  async getMyProject(role: string, clientProjectId: string | null | undefined) {
    const project = await this.assertClientProject(role, clientProjectId);

    return {
      ...ProjectMapper.toResponse(project),
      organizationName: project.workspace.organization.name,
    };
  }

  /**
   * Análisis de viabilidad de su proyecto, en solo lectura — un cliente
   * puede verlo pero no regenerarlo (eso lo dispara el dueño desde el
   * panel normal; regenerar cuesta dinero real de la API de la IA).
   */
  async getMyAnalysis(role: string, clientProjectId: string | null | undefined) {
    await this.assertClientProject(role, clientProjectId);

    const analysis = await this.prisma.projectAnalysis.findFirst({
      where: { projectId: clientProjectId as string },
      orderBy: { createdAt: 'desc' },
    });

    return analysis ? ProjectAnalysisMapper.toResponse(analysis) : null;
  }

  private async assertClientProject(
    role: string,
    clientProjectId: string | null | undefined,
  ) {
    if (role !== 'CLIENT' || !clientProjectId) {
      throw new ForbiddenException(
        'Este acceso es solo para cuentas de cliente',
      );
    }

    const project = await this.prisma.project.findFirst({
      where: { id: clientProjectId, deletedAt: null },
      include: { workspace: { include: { organization: true } } },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return project;
  }
}
