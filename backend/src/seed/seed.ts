import 'reflect-metadata';
import { AppDataSource, initializeDatabase } from '../config/data-source';
import { Structure } from '../entities/Structure';
import { User } from '../entities/User';
import { Doctor } from '../entities/Doctor';
import { Patient } from '../entities/Patient';
import { Specialization } from '../entities/Specialization';
import { Appointment } from '../entities/Appointment';
import { Report } from '../entities/Report';
import { Review } from '../entities/Review';
import { hashPassword } from '../utils/auth';
import {
  ADMINS,
  APPOINTMENT_REASONS,
  DOCTORS,
  DRAFT_REPORT_TEMPLATES,
  PASSWORDS,
  PATIENTS,
  REPORT_TEMPLATES,
  REVIEW_COMMENTS,
  SPECIALIZATIONS,
  STRUCTURES,
} from './seed-data';

async function clearAll() {
  const repos = [Review, Report, Appointment, Doctor, Patient, User, Specialization, Structure];
  for (const entity of repos) {
    const repo = AppDataSource.getRepository(entity);
    await repo.query(`DELETE FROM ${(repo.metadata as { tableName: string }).tableName}`);
  }
}

function daysFromNow(days: number, hour = 10, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function endTime(start: Date, minutes = 30): Date {
  return new Date(start.getTime() + minutes * 60_000);
}

function pick<T>(items: T[], index: number): T {
  return items[index % items.length];
}

async function main() {
  await initializeDatabase();
  console.log('Pulizia tabelle...');
  await clearAll();

  const structureRepo = AppDataSource.getRepository(Structure);
  const specRepo = AppDataSource.getRepository(Specialization);
  const userRepo = AppDataSource.getRepository(User);
  const doctorRepo = AppDataSource.getRepository(Doctor);
  const patientRepo = AppDataSource.getRepository(Patient);
  const apptRepo = AppDataSource.getRepository(Appointment);
  const reportRepo = AppDataSource.getRepository(Report);
  const reviewRepo = AppDataSource.getRepository(Review);

  const structures = await structureRepo.save(
    STRUCTURES.map((item) =>
      structureRepo.create({
        name: item.name,
        address: item.address,
        phone: item.phone,
        isActive: item.isActive ?? true,
      }),
    ),
  );

  const specializations = await specRepo.save(
    SPECIALIZATIONS.map((item) =>
      specRepo.create({
        name: item.name,
        description: item.description,
        structure: structures[item.structureIndex],
        isActive: item.isActive ?? true,
      }),
    ),
  );

  const specByName = new Map<string, Specialization>();
  for (const spec of specializations) {
    specByName.set(`${spec.structure.id}:${spec.name}`, spec);
  }

  const adminHash = await hashPassword(PASSWORDS.admin);
  await userRepo.save(
    ADMINS.map((item) =>
      userRepo.create({
        email: item.email,
        passwordHash: adminHash,
        role: 'admin',
        firstName: item.firstName,
        lastName: item.lastName,
      }),
    ),
  );

  const doctorHash = await hashPassword(PASSWORDS.doctor);
  const doctors: Doctor[] = [];
  for (const item of DOCTORS) {
    const structure = structures[item.structureIndex];
    const specialization =
      specByName.get(`${structure.id}:${item.specializationName}`) ?? null;
    const user = await userRepo.save(
      userRepo.create({
        email: item.email,
        passwordHash: doctorHash,
        role: 'doctor',
        firstName: item.firstName,
        lastName: item.lastName,
      }),
    );
    doctors.push(
      await doctorRepo.save(
        doctorRepo.create({
          user,
          structure,
          specialization,
          bio: item.bio,
          isActive: item.isActive ?? true,
        }),
      ),
    );
  }

  const patientHash = await hashPassword(PASSWORDS.patient);
  const patients: Patient[] = [];
  for (const item of PATIENTS) {
    const user = await userRepo.save(
      userRepo.create({
        email: item.email,
        passwordHash: patientHash,
        role: 'patient',
        firstName: item.firstName,
        lastName: item.lastName,
      }),
    );
    patients.push(
      await patientRepo.save(
        patientRepo.create({
          user,
          structure: structures[item.structureIndex],
          fiscalCode: item.fiscalCode,
          birthDate: item.birthDate,
          anamnesi: item.anamnesi,
          allergie: item.allergie,
        }),
      ),
    );
  }

  const activeDoctors = doctors.filter((d) => d.isActive !== false);
  const appointments: Appointment[] = [];
  let apptIndex = 0;

  for (const doctor of activeDoctors) {
    const doctorPatients = patients.filter((p) => p.structure.id === doctor.structure.id);
    const fallbackPatients = doctorPatients.length ? doctorPatients : patients;

    const slots: Array<{ days: number; hour: number; status: 'booked' | 'completed' | 'cancelled'; grant?: boolean }> = [
      { days: -1, hour: 9, status: 'booked' },
      { days: -1, hour: 10, status: 'booked', grant: true },
      { days: -1, hour: 11, status: 'booked' },
      { days: 2, hour: 15, status: 'booked' },
      { days: 3, hour: 10, status: 'booked', grant: true },
      { days: 5, hour: 11, status: 'booked' },
      { days: 7, hour: 16, status: 'booked' },
      { days: -28, hour: 16, status: 'completed' },
      { days: -3, hour: 9, status: 'completed' },
      { days: -7, hour: 10, status: 'completed' },
      { days: -14, hour: 11, status: 'completed' },
      { days: -21, hour: 15, status: 'completed' },
      { days: -5, hour: 14, status: 'cancelled' },
    ];

    for (const slot of slots) {
      const patient = pick(fallbackPatients, apptIndex);
      const startTime = daysFromNow(slot.days, slot.hour, (apptIndex % 2) * 15);
      appointments.push(
        await apptRepo.save(
          apptRepo.create({
            patient,
            doctor,
            structure: doctor.structure,
            startTime,
            endTime: endTime(startTime),
            status: slot.status,
            reason: pick(APPOINTMENT_REASONS, apptIndex),
            clinicalDataAccessGranted: slot.grant ?? slot.status === 'completed',
          }),
        ),
      );
      apptIndex += 1;
    }
  }

  const mario = patients.find((p) => p.user.email === 'mario.rossi@policlinico.it')!;
  const rossi = doctors.find((d) => d.user.email === 'dott.rossi@policlinico.it')!;
  if (mario && rossi) {
    const rossiFuture = appointments.find(
      (a) => a.doctor.id === rossi.id && a.status === 'booked' && a.startTime > new Date(),
    );
    if (rossiFuture) {
      rossiFuture.patient = mario;
      rossiFuture.reason = 'Controllo periodico cardiologico';
      rossiFuture.clinicalDataAccessGranted = false;
      await apptRepo.save(rossiFuture);
    }
  }

  let reportIndex = 0;
  const completed = appointments.filter((a) => a.status === 'completed');
  const reportableCompleted = completed.slice(0, 56);
  for (const appt of reportableCompleted) {
    const template = pick(REPORT_TEMPLATES, reportIndex);
    await reportRepo.save(
      reportRepo.create({
        appointment: appt,
        patient: appt.patient,
        doctor: appt.doctor,
        structure: appt.structure,
        diagnosis: template.diagnosis,
        prescriptions: template.prescriptions,
        notes: template.notes,
        status: 'published',
      }),
    );
    reportIndex += 1;
  }

  const booked = appointments.filter((a) => a.status === 'booked').slice(0, DRAFT_REPORT_TEMPLATES.length);
  for (let i = 0; i < booked.length; i += 1) {
    const appt = booked[i];
    const template = DRAFT_REPORT_TEMPLATES[i];
    await reportRepo.save(
      reportRepo.create({
        appointment: appt,
        patient: appt.patient,
        doctor: appt.doctor,
        structure: appt.structure,
        diagnosis: template.diagnosis,
        prescriptions: template.prescriptions || undefined,
        notes: template.notes || undefined,
        status: 'draft',
      }),
    );
  }

  let reviewIndex = 0;
  for (const appt of completed) {
    await reviewRepo.save(
      reviewRepo.create({
        patient: appt.patient,
        doctor: appt.doctor,
        appointment: appt,
        rating: 3 + (reviewIndex % 3),
        comment: pick(REVIEW_COMMENTS, reviewIndex),
      }),
    );
    reviewIndex += 1;
  }

  console.log('Seed completato.');
  console.log('');
  console.log('Riepilogo dati:');
  console.log(`  Strutture:        ${structures.length}`);
  console.log(`  Specializzazioni: ${specializations.length}`);
  console.log(`  Admin:            ${ADMINS.length}`);
  console.log(`  Medici:           ${doctors.length}`);
  console.log(`  Pazienti:         ${patients.length}`);
  console.log(`  Appuntamenti:     ${appointments.length}`);
  console.log(`  Referti pub.:     ${reportableCompleted.length}`);
  console.log(`  Referti bozza:    ${booked.length}`);
  console.log(`  Recensioni:       ${reviewIndex}`);
  console.log('');
  console.log('Account principali (password condivise per ruolo):');
  console.log(`  ADMIN    -> ${ADMINS[0].email} / ${PASSWORDS.admin}`);
  console.log(`  MEDICO   -> ${DOCTORS[0].email} / ${PASSWORDS.doctor}`);
  console.log(`  PAZIENTE -> ${PATIENTS[0].email} / ${PASSWORDS.patient}`);
  console.log('');
  console.log('Elenco completo: docs/account-demo.md');
  await AppDataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
