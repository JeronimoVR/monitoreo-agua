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

    if (user.id === paramsId) {
      return true;
    }

    throw new ForbiddenException('No tienes permiso para realizar esta accion');
  }
}