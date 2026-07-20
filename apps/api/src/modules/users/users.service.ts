import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { PasswordService } from '../crypto/password.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  /**
   * Lista únicamente los usuarios que comparten organización con el
   * llamante. Nunca debe devolver usuarios de otras organizaciones.
   */
  async findAllInOrganization(organizationId: string) {
    const users = await this.prisma.user.findMany({
      where: {
        memberships: {
          some: { organizationId },
        },
      },
    });

    return UserMapper.toResponseList(users);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserMapper.toResponse(user) : null;
  }

  /**
   * Crea el usuario y su organización propietaria en una única transacción.
   * Nunca debe existir un usuario sin al menos una organización: es la
   * base del aislamiento multi-tenant del resto de la plataforma.
   */
  async create(data: {
    name?: string;
    email: string;
    password: string;
    organizationName?: string;
  }) {
    const hashedPassword = await this.passwordService.hash(data.password);
    const organizationName =
      data.organizationName?.trim() || data.name?.trim() || data.email;

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
        },
      });

      await this.organizationsService.createWithOwner(
        organizationName,
        createdUser.id,
        tx,
      );

      return createdUser;
    });

    return UserMapper.toResponse(user);
  }

  /**
   * Login/registro con Google: si ya existe una Account vinculada, usa ese
   * usuario. Si el email ya existe sin cuenta de Google, vincula la nueva
   * Account a ese usuario (account linking). Si no existe nada, crea
   * usuario + organización + Account en una única transacción, igual que
   * el registro normal.
   */
  async findOrCreateFromGoogle(profile: {
    providerAccountId: string;
    email: string;
    name?: string;
    image?: string;
  }) {
    const existingAccount = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: profile.providerAccountId,
        },
      },
      include: { user: true },
    });

    if (existingAccount) {
      return existingAccount.user;
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (existingUser) {
      await this.prisma.account.create({
        data: {
          userId: existingUser.id,
          provider: 'google',
          providerAccountId: profile.providerAccountId,
        },
      });

      return existingUser;
    }

    const organizationName = profile.name?.trim() || profile.email;

    return this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          image: profile.image,
          emailVerified: true,
        },
      });

      await tx.account.create({
        data: {
          userId: createdUser.id,
          provider: 'google',
          providerAccountId: profile.providerAccountId,
        },
      });

      await this.organizationsService.createWithOwner(
        organizationName,
        createdUser.id,
        tx,
      );

      return createdUser;
    });
  }
}