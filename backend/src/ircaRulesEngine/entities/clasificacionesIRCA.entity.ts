import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('clasificaciones_irca')
export class ClasificacionIrca {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty()
  @Column({ type: 'text' })
  clasificacion: string;

  @ApiProperty()
  @Column({ type: 'float8' })
  valor_min: number;

  @ApiProperty()
  @Column({ type: 'float8' })
  valor_max: number;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  descripcion: string;
}