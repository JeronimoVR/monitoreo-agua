import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Muestreo } from './muestreos.entity';
import { Parametro } from '../../ircaRulesEngine/entities/parametros.entity';

@Entity('medidas')
export class Medida {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'id_muestreo', type: 'bigint' })
  id_muestreo: number;

  @ManyToOne(() => Muestreo, (muestreo) => muestreo.medidas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_muestreo' })
  muestreo: Muestreo;

  @Column({ name: 'id_parametro', type: 'bigint' })
  id_parametro: number;

  @ManyToOne(() => Parametro)
  @JoinColumn({ name: 'id_parametro' })
  parametro: Parametro;

  @Column({ type: 'float8' })
  valor: number;
}