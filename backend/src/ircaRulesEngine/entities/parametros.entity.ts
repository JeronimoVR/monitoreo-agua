import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Medida } from '../../sampling/entities/medidas.entity';
  import { ApiProperty } from '@nestjs/swagger';

@Entity('parametros')
export class Parametro {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  nombre: string;
  
  @ApiProperty()
  @Column({ name: 'unidad_medida' })
  unidadMedida: string;

  @ApiProperty()
  @Column({ name: 'valor_minimo', type: 'float' })
  valorMinimo: number;

  @ApiProperty()
  @Column({ name: 'valor_maximo', type: 'float' })
  valorMaximo: number;

  @ApiProperty()
  @Column({ name: 'puntaje_riesgo', type: 'float' })
  puntajeRiesgo: number;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @OneToMany(() => Medida, (medida) => medida.parametro)
  medidas: Medida[];
}