import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ConfigAlerta } from "./config-alerta.entity";

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

  @Column()
  rol: string;

  @OneToMany(() => ConfigAlerta, (config) => config.usuario)
  configuraciones: ConfigAlerta[];
}