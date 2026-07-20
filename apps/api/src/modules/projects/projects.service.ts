import { Injectable, NotFoundException } from '@nestjs/common';

import { generateUniqueSlug } from '../../common/utils/slug.util';
import { PrismaService } from '../../database/prisma.service';
import { ProjectMapper } from './mappers/project.mapper';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Doble aislamiento: cada consulta filtra por workspaceId Y, a través
   * de la relación, por workspace.organizationId. Así un usuario nunca
   * puede leer ni escribir un proyecto de un workspace que no pertenezca
   * a su propia organización, aunque adivine un workspaceId ajeno.
   */
  private scopedWhere(organizationId: string, workspaceId: string) {
    return {
      workspaceId,
      deletedAt: null,
      workspace: { organizationId, deletedAt: null },
    };
  }

  async create(
    organizationId: string,
    workspaceId: string,
    userId: string,
    data: {
      name: string;
      businessVertical?: string;
      description?: string;
    },
  ) {
    await this.assertWorkspaceInOrganization(organizationId, workspaceId);

    const slug = await generateUniqueSlug(data.name, async (candidate) => {
      const existing = await this.prisma.project.findUnique({
        where: {
          workspaceId_slug: {
            workspaceId,
            slug: candidate,
          },
        },
      });
      return existing !== null;
    });

    const project = await this.prisma.project.create({
      data: {
        workspaceId,
        name: data.name,
        slug,
        businessVertical: data.businessVertical,
        description: data.description,
        createdBy: userId,
      },
    });

    return ProjectMapper.toResponse(project);
  }

  async findAllInWorkspace(organizationId: string, workspaceId: string) {
    const projects = await this.prisma.project.findMany({
      where: this.scopedWhere(organizationId, workspaceId),
      orderBy: { createdAt: 'asc' },
    });

    return ProjectMapper.toResponseList(projects);
  }

  async findOneInWorkspace(
    organizationId: string,
    workspaceId: string,
    projectId: string,
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ...this.scopedWhere(organizationId, workspaceId) },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return ProjectMapper.toResponse(project);
  }

  async update(
    organizationId: string,
    workspaceId: string,
    projectId: string,
    data: {
      name?: string;
      businessVertical?: string;
      description?: string;
    },
  ) {
    // Reutiliza el mismo where con doble scoping: updateMany en vez de
    // update para que, si el proyecto no pertenece a esta organización,
    // simplemente no toque nada en lugar de lanzar un error de Prisma
    // que podría filtrar si el registro existe en otro tenant.
    const result = await this.prisma.project.updateMany({
      where: { id: projectId, ...this.scopedWhere(organizationId, workspaceId) },
      data: {
        name: data.name,
        businessVertical: data.businessVertical,
        description: data.description,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return this.findOneInWorkspace(organizationId, workspaceId, projectId);
  }

  /** Borrado lógico (deletedAt), no DELETE físico — conserva el histórico. */
  async remove(
    organizationId: string,
    workspaceId: string,
    projectId: string,
  ) {
    const result = await this.prisma.project.updateMany({
      where: { id: projectId, ...this.scopedWhere(organizationId, workspaceId) },
      data: { deletedAt: new Date() },
    });

    if (result.count === 0) {
      throw new NotFoundException('Proyecto no encontrado');
    }
  }

  private async assertWorkspaceInOrganization(
    organizationId: string,
    workspaceId: string,
  ) {
    const workspace = await this.prisma.workspace.findFirst({
      where: { id: workspaceId, organizationId, deletedAt: null },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace no encontrado');
    }
  }
}
