import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('irca_clasificacion')
export class IrcaClasificacion {
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