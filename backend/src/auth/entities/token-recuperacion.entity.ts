import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../users/entities/usuario.entity';
import { ApiProperty } from '@nestjs/swagger';


@Entity('tokens_recuperacion')
export class TokenRecuperacion {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty()
  @Column({ type: 'text' })
  token: string;

  @ApiProperty()
  @Column({ name: 'fecha_expiracion', type: 'timestamp' })
  fechaExpiracion: Date;

  @ApiProperty()
  @Column({ default: false })
  usado: boolean;

  @ApiProperty()
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}