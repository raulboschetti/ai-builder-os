import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  id: string;
  email: string;
  organizationId: string;
  role: string;
}

/**
 * Extrae el usuario autenticado (incluyendo su organización activa)
 * inyectado por JwtStrategy en `request.user`.
 *
 * Uso: findAll(@CurrentUser() user: AuthenticatedUser)
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
