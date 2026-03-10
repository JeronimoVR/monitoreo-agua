import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}