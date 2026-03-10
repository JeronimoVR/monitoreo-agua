// src/muestreos/entities/muestreo.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Estacion } from '../../estaciones/entities/estacion.entity';
import { Medida } from './medidas.entity';
import { IrcaClasificacion } from '../../ircaMotorReglas/entities/clasificacionesIRCA.entity';

@Entity('muestreos')
export class Muestreo {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Estacion)
  @JoinColumn({ name: 'id_estacion' })
  estacion: Estacion;

  @ManyToOne(() => IrcaClasificacion)
  @JoinColumn({ name: 'id_clasificacion_irca' })
  clasificacionIrca: IrcaClasificacion;

  @CreateDateColumn({ name: 'fecha_muestreo' })
  fechaMuestreo: Date;

  @Column({ type: 'float' })
  irca_calculado: number;

  @OneToMany(() => Medida, (medida) => medida.muestreo)
  medidas: Medida[];
}