import { randomBytes } from 'crypto';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvitationStatus, MembershipRole, NotificationType } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { PasswordService } from '../crypto/password.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InvitationMapper } from './mappers/invitation.mapper';

const INVITATION_TTL_DAYS = 7;

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Crea una invitación y envía el email. Siempre se scopea a la
   * organización del que llama (viene del JWT, nunca del body).
   */
  async create(organizationId: string, invitedBy: string, email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const alreadyMember = await this.prisma.membership.findFirst({
      where: { organizationId, user: { email: normalizedEmail } },
    });

    if (alreadyMember) {
      throw new ConflictException(
        'Este email ya pertenece a un miembro de la organización',
      );
    }

    const existingPending = await this.prisma.invitation.findFirst({
      where: {
        organizationId,
        email: normalizedEmail,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new ConflictException(
        'Ya hay una invitación pendiente para este email',
      );
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(
      Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    const invitation = await this.prisma.invitation.create({
      data: {
        organizationId,
        email: normalizedEmail,
        role: MembershipRole.MEMBER,
        token,
        invitedBy,
        expiresAt,
      },
      include: { organization: true },
    });

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const inviteUrl = `${frontendUrl}/invite/${token}`;

    await this.emailService.send({
      to: normalizedEmail,
      subject: `Te han invitado a ${invitation.organization.name} en Kroquix`,
      html: `
        <p>Te han invitado a unirte a <strong>${invitation.organization.name}</strong> en Kroquix.</p>
        <p><a href="${inviteUrl}">Aceptar invitación</a></p>
        <p>Este enlace caduca en ${INVITATION_TTL_DAYS} días.</p>
      `,
    });

    return InvitationMapper.toResponse(invitation);
  }

  async listPending(organizationId: string) {
    const invitations = await this.prisma.invitation.findMany({
      where: { organizationId, status: InvitationStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });

    return InvitationMapper.toResponseList(invitations);
  }

  async revoke(organizationId: string, invitationId: string) {
    const result = await this.prisma.invitation.updateMany({
      where: { id: invitationId, organizationId },
      data: { status: InvitationStatus.REVOKED },
    });

    if (result.count === 0) {
      throw new NotFoundException('Invitación no encontrada');
    }
  }

  /** Público — solo lo mínimo para mostrar la pantalla de "aceptar invitación". */
  async getByToken(token: string) {
    const invitation = await this.findValidInvitation(token);

    return {
      email: invitation.email,
      organizationName: invitation.organization.name,
    };
  }

  /**
   * Crea la cuenta y la membership en una transacción. A propósito NO
   * inicia sesión aquí — el controller hace login normal justo después,
   * reutilizando AuthService en vez de duplicar la lógica de emitir tokens.
   */
  async acceptAndCreateUser(
    token: string,
    data: { name?: string; password: string },
  ) {
    const invitation = await this.findValidInvitation(token);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Ya existe una cuenta con este email. Inicia sesión y pide que te añadan como miembro.',
      );
    }

    const hashedPassword = await this.passwordService.hash(data.password);

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: invitation.email,
          password: hashedPassword,
          emailVerified: true,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.ACCEPTED, acceptedAt: new Date() },
      });
    });

    const displayName = data.name?.trim() || invitation.email;
    await this.notificationsService.create(
      invitation.invitedBy,
      NotificationType.MEMBER_JOINED,
      `${displayName} se ha unido a tu organización`,
    );

    return { email: invitation.email, password: data.password };
  }

  private async findValidInvitation(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Esta invitación ya no está disponible');
    }

    if (invitation.expiresAt < new Date()) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new BadRequestException('Esta invitación ha caducado');
    }

    return invitation;
  }
}
