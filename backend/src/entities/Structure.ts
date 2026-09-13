import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Sede (ospedale/clinica). Il seed ne crea una: Policlinico di Bari. */
@Entity()
export class Structure {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ nullable: true, length: 300 })
  address?: string;

  @Column({ nullable: true, length: 50 })
  phone?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany('Doctor', 'structure')
  doctors!: import('./Doctor').Doctor[];

  @OneToMany('Patient', 'structure')
  patients!: import('./Patient').Patient[];

  @OneToMany('Specialization', 'structure')
  specializations!: import('./Specialization').Specialization[];
}
