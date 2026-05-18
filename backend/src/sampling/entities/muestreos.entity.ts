// src/muestreos/entities/muestreo.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Estacion } from '../../stations/entities/estacion.entity';
import { Medida } from './medidas.entity';
import { ClasificacionIrca } from '../../ircaRulesEngine/entities/clasificacionesIRCA.entity';

@Entity('muestreos')
export class Muestreo {
  @ApiProperty({ example: 1, description: 'ID único del muestreo' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({ example: 10, description: 'ID de la estación' })
  @Column({ name: 'id_estacion', type: 'bigint' })
  estacionId: number;

  @ManyToOne(() => Estacion)
  @JoinColumn({ name: 'id_estacion' })
  estacion: Estacion;

  @ApiProperty({ example: 5, description: 'ID de la clasificación IRCA' })
  @Column({ name: 'id_clasificacion_irca', type: 'bigint' })
  id_clasificacion_irca: number;

  @ManyToOne(() => ClasificacionIrca)
  @JoinColumn({ name: 'id_clasificacion_irca' })
  clasificacionIrca: ClasificacionIrca;

  @ApiProperty({ example: '2026-04-28T14:30:00.000Z', description: 'Fecha de captura de los datos' })
  @CreateDateColumn({ name: 'fecha_muestreo' })
  fechaMuestreo: Date;

  @ApiProperty({ example: 15.5, description: 'Puntaje IRCA calculado' })
  @Column({ type: 'float8' })
  irca_calculado: number;

  @ApiProperty({ type: () => Medida, isArray: true, description: 'Lista de medidas individuales' })
  @OneToMany(() => Medida, (medida) => medida.muestreo, { cascade: true })
  medidas: Medida[];
}