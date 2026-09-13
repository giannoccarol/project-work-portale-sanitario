import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { Patient } from './Patient';
import { Doctor } from './Doctor';
import { Structure } from './Structure';
import { Report } from './Report';

export type AppointmentStatus = 'booked' | 'completed' | 'cancelled';

/**
 * Appuntamento/prenotazione di una visita tra un Paziente e un Medico.
 */
@Entity()
@Index('UQ_appointment_doctor_start_booked', ['doctor', 'startTime'], {
  unique: true,
  where: `"status" = 'booked'`,
})
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Patient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => Doctor, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Doctor;

  @ManyToOne(() => Structure, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'structure_id' })
  structure!: Structure;

  @Column({ type: 'datetime' })
  startTime!: Date;

  @Column({ type: 'datetime' })
  endTime!: Date;

  @Column({ type: 'varchar', length: 20, default: 'booked' })
  status!: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ name: 'clinical_data_access_granted', type: 'boolean', default: false })
  clinicalDataAccessGranted!: boolean;

  @OneToOne('Report', 'appointment', { nullable: true })
  report?: Report;
}
