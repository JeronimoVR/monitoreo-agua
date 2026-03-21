import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Medida } from '../../muestreos/entities/medidas.entity';

@Entity('parametros')
export class Parametro {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  nombre: string; // Ej: pH, Turbidez, Cloro Libre Residual

  @Column({ name: 'unidad_medida' })
  unidadMedida: string; // Ej: mg/L, UNT, Unidades pH

  @Column({ name: 'valor_minimo', type: 'float' })
  valorMinimo: number;

  @Column({ name: 'valor_maximo', type: 'float' })
  valorMaximo: number;

  @Column({ name: 'puntaje_riesgo', type: 'float' })
  puntajeRiesgo: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @OneToMany(() => Medida, (medida) => medida.parametro)
  medidas: Medida[];
}