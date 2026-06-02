import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../users/entities/usuario.entity';

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const paramsId = parseInt(request.params.id, 10);

    if (user.rol === UserRole.ADMIN) {
      return true;
    }

    if (Number(user.id) === paramsId) {
      return true;
    }

    console.log('Usuario NO es admin y NO es el mismo');
    throw new ForbiddenException('No tienes permiso para realizar esta accion');
  }
}