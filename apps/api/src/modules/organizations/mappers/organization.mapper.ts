import { Organization } from '@prisma/client';

export class OrganizationMapper {
  static toResponse(organization: Organization) {
    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }

  static toResponseList(organizations: Organization[]) {
    return organizations.map((organization) => this.toResponse(organization));
  }
}
