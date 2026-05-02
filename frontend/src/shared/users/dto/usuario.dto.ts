export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: UserRole;
  deletedAt?: Date;
}
