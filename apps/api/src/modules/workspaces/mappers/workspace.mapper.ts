import { Workspace } from '@prisma/client';

export class WorkspaceMapper {
  static toResponse(workspace: Workspace) {
    return {
      id: workspace.id,
      organizationId: workspace.organizationId,
      name: workspace.name,
      slug: workspace.slug,
      createdBy: workspace.createdBy,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }

  static toResponseList(workspaces: Workspace[]) {
    return workspaces.map((workspace) => this.toResponse(workspace));
  }
}
