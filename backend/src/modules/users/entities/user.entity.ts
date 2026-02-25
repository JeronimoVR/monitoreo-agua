import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text', unique: true })
  correo: string;

  @Column({ type: 'text', select: false })
  contraseña: string;
}