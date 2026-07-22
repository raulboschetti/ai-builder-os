import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PasswordService } from '../crypto/password.service';
import { TokenService } from '../jwt/token.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Esta cuenta inicia sesión con Google, no con contraseña',
      );
    }

    const passwordIsValid = await this.passwordService.verify(
      password,
      user.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const membership = await this.organizationsService.findPrimaryMembership(
      user.id,
    );

    if (!membership) {
      // No debería ocurrir: todo usuario se crea con una organización.
      throw new UnauthorizedException(
        'El usuario no pertenece a ninguna organización',
      );
    }

    return this.buildSessionResponse(user, membership);
  }

  /**
   * Login/registro vía Google. usersService.findOrCreateFromGoogle ya
   * garantiza usuario + organización (crea, vincula, o reutiliza según
   * corresponda); aquí solo emitimos los tokens de sesión.
   */
  async loginWithGoogle(profile: {
    providerAccountId: string;
    email: string;
    name?: string;
    image?: string;
  }) {
    const user = await this.usersService.findOrCreateFromGoogle(profile);

    const membership = await this.organizationsService.findPrimaryMembership(
      user.id,
    );

    if (!membership) {
      throw new UnauthorizedException(
        'El usuario no pertenece a ninguna organización',
      );
    }

    return this.buildSessionResponse(user, membership);
  }

  /**
   * Cambia un refresh token válido por un par access+refresh nuevo.
   * Vuelve a leer la membership actual (no confía en lo que decía el
   * token viejo) por si el rol o la organización activa cambiaron
   * entre medias.
   */
  async refresh(refreshToken: string) {
    let payload: { sub: string };

    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o caducado');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Refresh token inválido o caducado');
    }

    const membership = await this.organizationsService.findPrimaryMembership(
      payload.sub,
    );

    if (!membership) {
      throw new UnauthorizedException(
        'El usuario no pertenece a ninguna organización',
      );
    }

    // findById devuelve el DTO mapeado (sin password); findByEmail sí la
    // trae, pero aquí no la necesitamos para reemitir tokens.
    return this.buildSessionResponse(
      { id: user.id, name: user.name, email: user.email },
      membership,
    );
  }

  /** Usado por GET /auth/me: reconstruye el contexto de sesión a partir del JWT ya validado. */
  async getCurrentUser(
    userId: string,
    organizationId: string,
    role: string,
    clientProjectId?: string | null,
  ) {
    const [profile, membership] = await Promise.all([
      this.usersService.findById(userId),
      this.organizationsService.findByIdForUser(organizationId, userId),
    ]);

    return {
      user: profile,
      organization: { ...membership, role, clientProjectId },
    };
  }

  private buildSessionResponse(
    user: { id: string; name: string | null; email: string },
    membership: NonNullable<
      Awaited<ReturnType<OrganizationsService['findPrimaryMembership']>>
    >,
  ) {
    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: membership.organizationId,
      role: membership.role,
      clientProjectId: membership.clientProjectId,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        role: membership.role,
        clientProjectId: membership.clientProjectId,
      },
    };
  }
}