import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Muestreo } from './muestreos.entity';
import { Parametro } from '../../ircaMotorReglas/entities/parametros.entity';

@Entity('medidas')
export class Medida {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Muestreo, (muestreo) => muestreo.medidas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_muestreo' })
  muestreo: Muestreo;

  @ManyToOne(() => Parametro)
  @JoinColumn({ name: 'id_parametro' })
  parametro: Parametro;

  @Column({ type: 'float' })
  valor: number;
}