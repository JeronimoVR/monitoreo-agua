import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('clasificaciones_irca')
export class ClasificacionIrca {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  clasificacion: string;

  @Column({ type: 'float8' })
  valor_min: number;

  @Column({ type: 'float8' })
  valor_max: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;
}