import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from './Appointment';
import { Patient } from './Patient';
import { Doctor } from './Doctor';
import { Structure } from './Structure';

export type ReportStatus = 'draft' | 'published';

/**
 * Referto medico associato a un Appuntamento. Contiene campi strutturati
 * e, opzionalmente, un allegato PDF (percorso su filesystem).
 */
@Entity()
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Appointment, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'appointment_id' })
  appointment!: Appointment;

  @ManyToOne(() => Patient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => Doctor, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Doctor;

  @ManyToOne(() => Structure, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'structure_id' })
  structure!: Structure;

  @Column({ type: 'text' })
  diagnosis!: string;

  @Column({ type: 'text', nullable: true })
  prescriptions?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: ReportStatus;

  @Column({ name: 'attachment_path', nullable: true, length: 500 })
  attachmentPath?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
