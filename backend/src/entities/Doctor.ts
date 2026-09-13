import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Structure } from './Structure';
import { Specialization } from './Specialization';
import { Appointment } from './Appointment';
import { Report } from './Report';

/**
 * Medico: profilo collegato a un User (ruolo 'doctor'),
 * affiliato a una Struttura e a una Specializzazione.
 */
@Entity()
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Structure, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'structure_id' })
  structure!: Structure;

  @ManyToOne(() => Specialization, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'specialization_id' })
  specialization?: Specialization | null;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany('Appointment', 'doctor')
  appointments!: Appointment[];

  @OneToMany('Report', 'doctor')
  reports!: Report[];
}
