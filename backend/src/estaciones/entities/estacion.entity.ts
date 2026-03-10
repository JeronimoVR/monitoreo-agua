import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Muestreo } from '../../muestreos/entities/muestreos.entity';

@Entity('estaciones')
export class Estacion {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitud: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitud: number;

  @OneToMany(() => Muestreo, (muestreo) => muestreo.estacion)
  muestreos: Muestreo[];
}