import { ApiProperty } from "@nestjs/swagger";
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ConfigAlerta } from "./config-alerta.entity";

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('usuarios')
export class Usuario {
  @ApiProperty({ example: 1, description: 'ID único del usuario' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo' })
  @Column()
  nombre: string;

  @ApiProperty({ example: 'juan@ejemplo.com', description: 'Correo electrónico único' })
  @Column({ unique: true })
  correo: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER, description: 'Rol del usuario en el sistema' })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  rol: UserRole;

  @OneToMany(() => ConfigAlerta, (config) => config.usuario, { cascade: true })
  configuraciones: ConfigAlerta[];

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt: Date; 

  @Column({ name: 'fecha_registro', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaRegistro: Date;
}
