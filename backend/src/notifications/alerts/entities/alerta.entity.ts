import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Estacion } from '../../../stations/entities/estacion.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('alertas')
export class Alerta {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty()
  @Column()
  mensaje: string;

  @ApiProperty()
  @Column({ default: 'CRITICA' })
  tipo: string;

  @ApiProperty()
  @Column({ default: false })
  leida: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @ApiProperty({ required: false, description: 'Lista de correos destinatarios (separados por coma) para trazabilidad' })
  @Column({ type: 'text', nullable: true })
  destinatarios?: string;

  @ApiProperty({ required: false, description: 'Detalle estructurado de la alerta (payload)' })
  @Column({ type: 'jsonb', nullable: true })
  detalle?: any;

  @ManyToOne(() => Estacion)
  estacion: Estacion;
}
