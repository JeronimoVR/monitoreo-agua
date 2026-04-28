import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ConfigAlerta } from "./config-alerta.entity";

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  correo: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  rol: UserRole;

  @OneToMany(() => ConfigAlerta, (config) => config.usuario)
  configuraciones: ConfigAlerta[];
}
