import { Project } from '@prisma/client';

export class ProjectMapper {
  static toResponse(project: Project) {
    return {
      id: project.id,
      workspaceId: project.workspaceId,
      name: project.name,
      slug: project.slug,
      status: project.status,
      businessVertical: project.businessVertical,
      description: project.description,
      whatsappNumber: project.whatsappNumber,
      buildStage: project.buildStage,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  static toResponseList(projects: Project[]) {
    return projects.map((project) => this.toResponse(project));
  }
}
