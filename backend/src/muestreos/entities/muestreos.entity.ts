// src/muestreos/entities/muestreo.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Estacion } from '../../estaciones/entities/estacion.entity';
import { Medida } from './medidas.entity';
import { ClasificacionIrca } from '../../ircaMotorReglas/entities/clasificacionesIRCA.entity';

@Entity('muestreos')
export class Muestreo {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'id_estacion', type: 'bigint' })
  id_estacion: number;

  @ManyToOne(() => Estacion)
  @JoinColumn({ name: 'id_estacion' })
  estacion: Estacion;

  @Column({ name: 'id_clasificacion_irca', type: 'bigint' })
  id_clasificacion_irca: number;

  @ManyToOne(() => ClasificacionIrca)
  @JoinColumn({ name: 'id_clasificacion_irca' })
  clasificacionIrca: ClasificacionIrca;

  @CreateDateColumn({ name: 'fecha_muestreo' })
  fecha_muestreo: Date;

  @Column({ type: 'float8' })
  irca_calculado: number;

  @OneToMany(() => Medida, (medida) => medida.muestreo, { cascade: true })
  medidas: Medida[];
}