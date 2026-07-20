import { Injectable, NotFoundException } from '@nestjs/common';

import { generateUniqueSlug } from '../../common/utils/slug.util';
import { PrismaService } from '../../database/prisma.service';
import { WorkspaceMapper } from './mappers/workspace.mapper';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Todo método de este servicio recibe `organizationId` explícitamente
   * (viene del JWT del que llama, nunca del body) y lo aplica siempre
   * en el `where`. Es la misma regla de aislamiento que en Organizations:
   * ninguna consulta de negocio se hace sin filtrar por tenant.
   */
  async create(organizationId: string, userId: string, name: string) {
    const slug = await generateUniqueSlug(name, async (candidate) => {
      const existing = await this.prisma.workspace.findUnique({
        where: {
          organizationId_slug: {
            organizationId,
            slug: candidate,
          },
        },
      });
      return existing !== null;
    });

    const workspace = await this.prisma.workspace.create({
      data: {
        organizationId,
        name,
        slug,
        createdBy: userId,
      },
    });

    return WorkspaceMapper.toResponse(workspace);
  }

  async findAllInOrganization(organizationId: string) {
    const workspaces = await this.prisma.workspace.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    return WorkspaceMapper.toResponseList(workspaces);
  }

  async findOneInOrganization(organizationId: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: { id: workspaceId, organizationId, deletedAt: null },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace no encontrado');
    }

    return WorkspaceMapper.toResponse(workspace);
  }
}
