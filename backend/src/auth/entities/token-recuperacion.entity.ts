import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('tokens_recuperacion')
export class TokenRecuperacion {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  token: string;

  @Column({ name: 'fecha_expiracion', type: 'timestamp' })
  fechaExpiracion: Date;

  @Column({ default: false })
  usado: boolean;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}