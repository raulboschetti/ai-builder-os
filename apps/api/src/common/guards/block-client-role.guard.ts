import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

/**
 * Los usuarios con rol CLIENT solo pueden usar /client/*. Este guard se
 * añade a todo lo demás (usuarios, organización, workspaces, invitaciones,
 * proyectos "normales") para que, aunque alguien adivinara la ruta, el
 * backend lo rechace — no basta con que el frontend no le muestre el menú.
 */
@Injectable()
export class BlockClientRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (user?.role === 'CLIENT') {
      throw new ForbiddenException(
        'Las cuentas de cliente no tienen acceso a esta sección',
      );
    }

    return true;
  }
}
