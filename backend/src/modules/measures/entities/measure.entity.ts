import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Station } from '../../stations/entities/station.entity';

@Entity('medidas')
export class Measure {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ type: 'float' })
  pH: number;

  @Column({ name: 'contuctividad_electrica', type: 'float' })
  conductividad: number;

  @Column({ type: 'float' })
  turbidez: number;

  @Column({ type: 'float' })
  temperatura: number;

  @Column({ name: 'oxigeno_disuelto', type: 'float' })
  oxigeno: number;

  @Column({ name: 'IRCA_calculado', type: 'float', nullable: true })
  ircaCalculado: number;

  // Relación con Estación
  @ManyToOne(() => Station, (station) => station.medidas)
  @JoinColumn({ name: 'estacion_id' })
  estacion: Station;

  @Column({ name: 'estacion_id', type: 'bigint' })
  estacionId: number;
}