import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Measure } from '../../measures/entities/measure.entity';

@Entity('estaciones')
export class Station {
  @PrimaryColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'text', unique: true })
  nombre: string;

  @Column({ type: 'text' })
  ubicacion: string;

  @OneToMany(() => Measure, (measure) => measure.estacion)
  medidas: Measure[];
}