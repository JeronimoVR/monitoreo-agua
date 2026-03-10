import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Muestreo } from './muestreos.entity';

@Entity('medidas')
export class Medida {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'float' })
  valor: number;

  @Column({ type: 'bigint' })
  id_parametro: number; // Relación con la tabla parámetros

  @ManyToOne(() => Muestreo, (muestreo) => muestreo.medidas)
  muestreo: Muestreo;
}