import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  /**
   * Renombra la organización. Solo el OWNER puede hacerlo — el rol viene
   * del JWT (ya validado al hacer login), pero lo comprobamos aquí también
   * porque el token puede llevar tiempo emitido y el rol pudo cambiar.
   */
  async updateName(organizationId: string, userId: string, name: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership || membership.role !== MembershipRole.OWNER) {
      throw new ForbiddenException(
        'Solo el propietario de la organización puede cambiar su nombre',
      );
    }

    const organization = await this.prisma.organization.update({
      where: { id: organizationId },
      data: { name },
    });

    return OrganizationMapper.toResponse(organization);
  }

  /**
   * Quita a un miembro de la organización (borra su membership, no su
   * cuenta de usuario — sigue existiendo, solo pierde el acceso a esta
   * organización). Solo el OWNER puede hacerlo, no puede quitarse a sí
   * mismo (evita quedarse sin dueño por accidente), y solo aplica a
   * miembros normales (MEMBER/ADMIN), no a accesos de tipo CLIENT —
   * esos se gestionan desde el proyecto, no desde aquí.
   */
  async removeMember(
    organizationId: string,
    requesterId: string,
    targetUserId: string,
  ) {
    if (requesterId === targetUserId) {
      throw new ForbiddenException(
        'No puedes quitarte a ti mismo del equipo desde aquí',
      );
    }

    const requesterMembership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId: requesterId, organizationId },
      },
    });

    if (!requesterMembership || requesterMembership.role !== MembershipRole.OWNER) {
      throw new ForbiddenException(
        'Solo el propietario de la organización puede quitar miembros',
      );
    }

    const result = await this.prisma.membership.deleteMany({
      where: {
        userId: targetUserId,
        organizationId,
        role: { in: [MembershipRole.MEMBER, MembershipRole.ADMIN] },
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Miembro no encontrado');
    }
  }
}
