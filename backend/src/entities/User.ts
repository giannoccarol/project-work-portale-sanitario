import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole = 'patient' | 'doctor' | 'admin';

/**
 * Utente base del sistema. Centralizza le credenziali e il ruolo;
 * Pazienti e Medici estendono il profilo tramite relazioni OneToOne.
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 200 })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 20 })
  role!: UserRole;

  @Column({ name: 'first_name', nullable: true, length: 100 })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true, length: 100 })
  lastName?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne('Patient', 'user', { nullable: true })
  patient?: import('./Patient').Patient;

  @OneToOne('Doctor', 'user', { nullable: true })
  doctor?: import('./Doctor').Doctor;
}
