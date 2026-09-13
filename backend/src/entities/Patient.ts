import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './User';
import { Structure } from './Structure';
import { Appointment } from './Appointment';
import { Report } from './Report';

/**
 * Paziente: profilo collegato a un User (ruolo 'patient').
 */
@Entity()
@Index('UQ_patient_fiscal_code', ['fiscalCode'], { unique: true })
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Structure, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'structure_id' })
  structure!: Structure;

  @Column({ name: 'fiscal_code', nullable: true, length: 16 })
  fiscalCode?: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate?: string;

  @Column({ type: 'text', nullable: true })
  anamnesi?: string;

  @Column({ type: 'text', nullable: true })
  allergie?: string;

  @OneToMany('Appointment', 'patient')
  appointments!: Appointment[];

  @OneToMany('Report', 'patient')
  reports!: Report[];
}
