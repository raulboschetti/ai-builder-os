import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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

    try {
      const workspace = await this.prisma.workspace.create({
        data: {
          organizationId,
          name,
          slug,
          createdBy: userId,
        },
      });

      return WorkspaceMapper.toResponse(workspace);
    } catch (error) {
      // Dos peticiones casi simultáneas (p.ej. un efecto de React que se
      // dispara dos veces en desarrollo) pueden comprobar el slug libre
      // a la vez y las dos intentar crearlo. En vez de que la segunda
      // falle con un 500, devolvemos el workspace que ya se creó.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await this.prisma.workspace.findUnique({
          where: {
            organizationId_slug: { organizationId, slug },
          },
        });

        if (existing) {
          return WorkspaceMapper.toResponse(existing);
        }
      }

      throw error;
    }
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
