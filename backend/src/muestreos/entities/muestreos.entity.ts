import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Estacion } from '../../estaciones/entities/estacion.entity';
import { Medida } from './medidas.entity';

@Entity('muestreos')
export class Muestreo {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @CreateDateColumn({ name: 'fecha_muestreo' })
  fechaMuestreo: Date;

  @Column({ type: 'float', nullable: true })
  irca_calculado: number;

  @ManyToOne(() => Estacion, (estacion) => estacion.muestreos)
  estacion: Estacion;

  @OneToMany(() => Medida, (medida) => medida.muestreo)
  medidas: Medida[];
}