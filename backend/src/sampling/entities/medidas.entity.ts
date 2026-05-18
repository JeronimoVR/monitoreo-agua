import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Muestreo } from './muestreos.entity';
import { Parametro } from '../../ircaRulesEngine/entities/parametros.entity';

@Entity('medidas')
export class Medida {
  @ApiProperty({ example: 1, description: 'ID único de la medida' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID del muestreo padre' })
  @Column({ name: 'id_muestreo', type: 'bigint' })
  id_muestreo: number;

  @ManyToOne(() => Muestreo, (muestreo) => muestreo.medidas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_muestreo' })
  muestreo: Muestreo;

  @ApiProperty({ example: 1, description: 'ID del parámetro medido' })
  @Column({ name: 'id_parametro', type: 'bigint' })
  id_parametro: number;

  @ManyToOne(() => Parametro)
  @JoinColumn({ name: 'id_parametro' })
  parametro: Parametro;

  @ApiProperty({ example: 7.5, description: 'Valor de la medición' })
  @Column({ type: 'float8' })
  valor: number;
}