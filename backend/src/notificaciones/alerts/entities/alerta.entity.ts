import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Estacion } from '../../../estaciones/entities/estacion.entity';

@Entity('alertas')
export class Alerta {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  mensaje: string;

  @Column({ default: 'CRITICA' })
  tipo: string;

  @Column({ default: false })
  leida: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @ManyToOne(() => Estacion)
  estacion: Estacion;
}