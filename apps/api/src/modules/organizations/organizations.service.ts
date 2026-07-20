import { Injectable, NotFoundException } from '@nestjs/common';
import { MembershipRole, Prisma } from '@prisma/client';

import { generateUniqueSlug } from '../../common/utils/slug.util';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationMapper } from './mappers/organization.mapper';

type PrismaTransactionClient = Prisma.TransactionClient;

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una organización y da de alta al usuario indicado como OWNER.
   * Acepta un cliente de transacción opcional para poder crearse junto
   * con el usuario (p.ej. en el registro) de forma atómica.
   */
  async createWithOwner(
    name: string,
    ownerId: string,
    client: PrismaTransactionClient | PrismaService = this.prisma,
  ) {
    const slug = await generateUniqueSlug(name, async (candidate) => {
      const existing = await client.organization.findUnique({
        where: { slug: candidate },
      });
      return existing !== null;
    });

    const organization = await client.organization.create({
      data: {
        name,
        slug,
        memberships: {
          create: {
            userId: ownerId,
            role: MembershipRole.OWNER,
          },
        },
      },
    });

    return organization;
  }

  /** Organizaciones a las que pertenece el usuario autenticado. */
  async findMineForUser(userId: string) {
    const organizations = await this.prisma.organization.findMany({
      where: {
        deletedAt: null,
        memberships: {
          some: { userId },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return OrganizationMapper.toResponseList(organizations);
  }

  /**
   * Devuelve una organización solo si el usuario pertenece a ella.
   * Esta es la comprobación de aislamiento multi-tenant: nunca se
   * consulta una organización por id sin filtrar también por membership.
   */
  async findByIdForUser(organizationId: string, userId: string) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        deletedAt: null,
        memberships: { some: { userId } },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organización no encontrada');
    }

    return OrganizationMapper.toResponse(organization);
  }

  /** Primera membership del usuario (organización "activa" por defecto tras login). */
  async findPrimaryMembership(userId: string) {
    return this.prisma.membership.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: { organization: true },
    });
  }
}
