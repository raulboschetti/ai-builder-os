import { Invitation } from '@prisma/client';

export class InvitationMapper {
  /** Nunca incluye el token en listados — solo se entrega en el email. */
  static toResponse(invitation: Invitation) {
    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
    };
  }

  static toResponseList(invitations: Invitation[]) {
    return invitations.map((invitation) => this.toResponse(invitation));
  }
}
