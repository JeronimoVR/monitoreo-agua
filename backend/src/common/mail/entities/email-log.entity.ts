import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('email_logs')
export class EmailLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  destinatario: string;

  @Column()
  asunto: string;

  @Column()
  template: string;

  @Column({ type: 'json' })
  contexto: any;

  @Column({ type: 'varchar', length: 20 })
  estado: 'PENDIENTE' | 'EXITOSO' | 'FALLIDO';

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ default: 0 })
  reintentos: number;

  @Column({ nullable: true })
  tiempoEnvioMs: number;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    default: () => "timezone('America/Bogota', now())",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    default: () => "timezone('America/Bogota', now())",
  })
  updatedAt: Date;
}
