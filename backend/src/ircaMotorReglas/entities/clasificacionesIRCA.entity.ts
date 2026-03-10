import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('clasificaciones_irca')
export class ClasificacionesIRCA {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nivel_riesgo: string;

    @Column({ type: 'float' })
    rango_min: number;

    @Column({ type: 'float' })
    rango_max: number;

    @Column()
    color_hex: string;

    @Column('text')
    recomendacion: string;
}