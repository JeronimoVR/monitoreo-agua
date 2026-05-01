import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Estacion } from '../../stations/entities/estacion.entity';

@Entity('configuraciones_alertas')
export class ConfigAlerta {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'recibe_alerta', default: true })
  recibeAlerta: boolean;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Estacion)
  @JoinColumn({ name: 'id_estacion' })
  estacion: Estacion;
}