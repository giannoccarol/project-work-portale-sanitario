import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Structure } from './Structure';
import { Doctor } from './Doctor';

/**
 * Specializzazione medica (es. Cardiologia, Dermatologia),
 * afferente a una Struttura.
 */
@Entity()
export class Specialization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(() => Structure, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'structure_id' })
  structure!: Structure;

  @OneToMany('Doctor', 'specialization')
  doctors!: Doctor[];
}
