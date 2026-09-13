import type { Server } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';
import { AppDataSource, initializeDatabase } from '../config/data-source';
import { app } from '../index';
import { Appointment, Doctor, Patient, Report, Specialization, Structure, User } from '../entities';
import { generateToken } from '../utils/auth';
import { AppointmentService } from '../modules/appointments/appointments.service';
import { PatientService } from '../modules/patients/patients.service';
import { ReportService } from '../modules/reports/reports.service';
import { ReviewService } from '../modules/reviews/reviews.service';
import { AppError } from '../utils/errors';
import { AuthService } from '../modules/auth/auth.service';
import { config } from '../config/env';

describe('Backend integration policies', () => {
  let server: Server;
  let baseUrl: string;
  let structureA: Structure;
  let structureB: Structure;
  let doctorUser: User;
  let doctor: Doctor;
  let patientUser: User;
  let patientUser2: User;
  let foreignPatientUser: User;
  let patient: Patient;
  let patient2: Patient;
  let completedAppointment: Appointment;
  let contextAppointment: Appointment;
  let futureAppointment: Appointment;
  let uploadDir: string;
  const originalUploadsDir = config.uploadsDir;

  const appointmentService = new AppointmentService();
  const patientService = new PatientService();
  const reportService = new ReportService();
  const reviewService = new ReviewService();
  const authService = new AuthService();

  function pdfFile(name: string, marker = 'test'): Express.Multer.File {
    return {
      fieldname: 'attachment',
      originalname: name,
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 32,
      buffer: Buffer.from(`%PDF-1.4\n${marker}\n%%EOF\n`),
      destination: '',
      filename: '',
      path: '',
      stream: undefined as never,
    };
  }

  async function createUser(email: string, role: User['role'], firstName: string, lastName: string) {
    return AppDataSource.getRepository(User).save(
      AppDataSource.getRepository(User).create({ email, role, firstName, lastName, passwordHash: 'test-hash' }),
    );
  }

  async function createPatient(user: User, structure: Structure, fiscalCode: string) {
    return AppDataSource.getRepository(Patient).save(
      AppDataSource.getRepository(Patient).create({
        user,
        structure,
        fiscalCode,
        birthDate: '1990-01-01',
        anamnesi: 'Ipertensione controllata',
        allergie: 'Penicillina',
      }),
    );
  }

  async function createAppointment(
    owner: Patient,
    assignedDoctor: Doctor,
    startTime: Date,
    status: Appointment['status'],
    consent = false,
  ) {
    return AppDataSource.getRepository(Appointment).save(
      AppDataSource.getRepository(Appointment).create({
        patient: owner,
        doctor: assignedDoctor,
        structure: assignedDoctor.structure,
        startTime,
        endTime: new Date(startTime.getTime() + 30 * 60_000),
        status,
        clinicalDataAccessGranted: consent,
      }),
    );
  }

  function futureLocalSlot(daysAhead: number, hour = 9, minute = 0) {
    const value = new Date();
    value.setDate(value.getDate() + daysAhead);
    value.setHours(hour, minute, 0, 0);
    return value;
  }

  function token(user: User) {
    return generateToken({ sub: user.id, email: user.email, role: user.role });
  }

  async function request(path: string, bearer: string, init: RequestInit = {}) {
    return fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${bearer}`,
        'content-type': 'application/json',
        ...(init.headers ?? {}),
      },
    });
  }

  beforeAll(async () => {
    uploadDir = await fs.promises.mkdtemp(path.join(tmpdir(), 'puglia-salute-upload-'));
    config.uploadsDir = uploadDir;
    await initializeDatabase();

    const structureRepo = AppDataSource.getRepository(Structure);
    structureA = await structureRepo.save(structureRepo.create({ name: 'Presidio Bari', isActive: true }));
    structureB = await structureRepo.save(structureRepo.create({ name: 'Presidio Lecce', isActive: true }));

    const specializationRepo = AppDataSource.getRepository(Specialization);
    const specializationA = await specializationRepo.save(
      specializationRepo.create({ name: 'Cardiologia', structure: structureA, isActive: true }),
    );

    doctorUser = await createUser('doctor.integration@example.test', 'doctor', 'Ada', 'Medica');
    doctor = await AppDataSource.getRepository(Doctor).save(
      AppDataSource.getRepository(Doctor).create({
        user: doctorUser,
        structure: structureA,
        specialization: specializationA,
        isActive: true,
      }),
    );

    patientUser = await createUser('patient.integration@example.test', 'patient', 'Pia', 'Rossi');
    patientUser2 = await createUser('patient2.integration@example.test', 'patient', 'Leo', 'Bianchi');
    foreignPatientUser = await createUser('foreign.integration@example.test', 'patient', 'Mia', 'Verdi');
    patient = await createPatient(patientUser, structureA, 'RSSPIA90A01A662X');
    patient2 = await createPatient(patientUser2, structureA, 'BNCLCU90A01A662Y');
    await createPatient(foreignPatientUser, structureB, 'VRDMIA90A01A662Z');

    completedAppointment = await createAppointment(
      patient,
      doctor,
      new Date(Date.now() - 48 * 60 * 60_000),
      'completed',
    );
    contextAppointment = await createAppointment(
      patient,
      doctor,
      new Date(Date.now() - 24 * 60 * 60_000),
      'booked',
    );
    futureAppointment = await createAppointment(patient, doctor, futureLocalSlot(4, 11), 'booked');

    await AppDataSource.getRepository(Report).save(
      AppDataSource.getRepository(Report).create({
        appointment: completedAppointment,
        patient,
        doctor,
        structure: structureA,
        diagnosis: 'Controllo completato',
        status: 'published',
      }),
    );
    await AppDataSource.getRepository(Report).save(
      AppDataSource.getRepository(Report).create({
        appointment: contextAppointment,
        patient,
        doctor,
        structure: structureA,
        diagnosis: 'Bozza riservata al medico proprietario',
        status: 'draft',
      }),
    );

    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server address unavailable');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    if (server) await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
    config.uploadsDir = originalUploadsDir;
    if (uploadDir) await fs.promises.rm(uploadDir, { recursive: true, force: true });
  });

  test('auth/me resolves the owning patient and doctor profile', async () => {
    const patientResponse = await request('/api/v1/auth/me', token(patientUser));
    const patientBody = await patientResponse.json() as { patient?: { id: string }; doctor?: unknown };
    expect(patientResponse.status).toBe(200);
    expect(patientBody.patient?.id).toBe(patient.id);
    expect(patientBody.doctor).toBeUndefined();

    const doctorResponse = await request('/api/v1/auth/me', token(doctorUser));
    const doctorBody = await doctorResponse.json() as { doctor?: { id: string }; patient?: unknown };
    expect(doctorResponse.status).toBe(200);
    expect(doctorBody.doctor?.id).toBe(doctor.id);
    expect(doctorBody.patient).toBeUndefined();
  });

  test('an archived doctor cannot keep using an already issued token', async () => {
    const issuedToken = token(doctorUser);
    doctor.isActive = false;
    await AppDataSource.getRepository(Doctor).save(doctor);

    const response = await request('/api/v1/auth/me', issuedToken);
    expect(response.status).toBe(403);
    expect((await response.json()) as object).toMatchObject({ code: 'DOCTOR_ARCHIVED' });

    doctor.isActive = true;
    await AppDataSource.getRepository(Doctor).save(doctor);
  });

  test('patient identity is unique by fiscal code as well as email', async () => {
    await expect(authService.registerPatient({
      email: 'another.identity@example.test',
      password: 'Password-123!',
      firstName: 'Altra',
      lastName: 'Persona',
      structureId: structureA.id,
      fiscalCode: patient.fiscalCode!,
      birthDate: '1991-02-03',
    })).rejects.toMatchObject({ status: 409, code: 'FISCAL_CODE_ALREADY_REGISTERED' });
  });

  test('runtime validation rejects string booleans and unknown review fields', async () => {
    const consentResponse = await request(
      `/api/v1/appointments/${contextAppointment.id}/clinical-access`,
      token(patientUser),
      { method: 'PATCH', body: JSON.stringify({ granted: 'false' }) },
    );
    expect(consentResponse.status).toBe(400);
    expect(((await consentResponse.json()) as { code: string }).code).toBe('VALIDATION_ERROR');

    const reviewResponse = await request('/api/v1/reviews', token(patientUser), {
      method: 'POST',
      body: JSON.stringify({ doctorId: doctor.id, rating: 5 }),
    });
    expect(reviewResponse.status).toBe(400);
    expect(((await reviewResponse.json()) as { code: string }).code).toBe('VALIDATION_ERROR');
  });

  test('booking enforces tenant coherence', async () => {
    await expect(
      appointmentService.book(foreignPatientUser.id, {
        doctorId: doctor.id,
        startTime: futureLocalSlot(6, 9, 30).toISOString(),
      }),
    ).rejects.toMatchObject({ status: 403, code: 'TENANT_MISMATCH' });
  });

  test('the database constraint accepts only one concurrent booking for a slot', async () => {
    const startTime = futureLocalSlot(7, 9).toISOString();
    const results = await Promise.allSettled([
      appointmentService.book(patientUser.id, { doctorId: doctor.id, startTime }),
      appointmentService.book(patientUser2.id, { doctorId: doctor.id, startTime }),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
    expect(rejected?.reason).toMatchObject({ status: 409, code: 'SLOT_UNAVAILABLE' });
  });

  test('clinical folder exposes only the visit context and consented published clinical data', async () => {
    const withoutConsent = await patientService.buildFolder(patient.id, {
      role: 'doctor',
      userId: doctorUser.id,
      appointmentId: contextAppointment.id,
    });
    expect(withoutConsent.patient).not.toHaveProperty('fiscalCode');
    expect((withoutConsent.sections.find((section) => section.key === 'appuntamenti')?.data as unknown[])).toHaveLength(1);
    expect(withoutConsent.sections.find((section) => section.key === 'referti')).toMatchObject({ locked: true, data: null });

    contextAppointment.clinicalDataAccessGranted = true;
    await AppDataSource.getRepository(Appointment).save(contextAppointment);
    const withConsent = await patientService.buildFolder(patient.id, {
      role: 'doctor',
      userId: doctorUser.id,
      appointmentId: contextAppointment.id,
    });
    const reports = withConsent.sections.find((section) => section.key === 'referti');
    expect(reports?.locked).toBe(false);
    expect(reports?.data).toHaveLength(1);
    expect((reports?.data as Array<{ status: string }>).every((report) => report.status === 'published')).toBe(true);

    const adminUser = await createUser('admin.integration@example.test', 'admin', 'Admin', 'Puglia');
    const adminFolder = await patientService.buildFolder(patient.id, { role: 'admin', userId: adminUser.id });
    expect(adminFolder.sections.find((section) => section.key === 'referti')).toMatchObject({ locked: true, data: null });
  });

  test('reviews derive the doctor from one completed appointment and reject duplicates', async () => {
    await expect(
      reviewService.create(patientUser.id, { appointmentId: contextAppointment.id, rating: 4 }),
    ).rejects.toMatchObject({ status: 409, code: 'APPOINTMENT_NOT_COMPLETED' });
    await expect(
      reviewService.create(foreignPatientUser.id, { appointmentId: completedAppointment.id, rating: 4 }),
    ).rejects.toMatchObject({ status: 403, code: 'REVIEW_FORBIDDEN' });

    const review = await reviewService.create(patientUser.id, {
      appointmentId: completedAppointment.id,
      rating: 5,
      comment: 'Visita accurata',
    });
    expect(review.doctor.id).toBe(doctor.id);
    await expect(
      reviewService.create(patientUser.id, { appointmentId: completedAppointment.id, rating: 4 }),
    ).rejects.toMatchObject({ status: 409, code: 'REVIEW_ALREADY_EXISTS' });
  });

  test('reports cannot be created or published before the visit starts', async () => {
    await expect(
      reportService.create(doctorUser.id, futureAppointment.id, { diagnosis: 'Troppo presto' }),
    ).rejects.toMatchObject({ status: 409, code: 'VISIT_NOT_STARTED' });

    const futureDraft = await AppDataSource.getRepository(Report).save(
      AppDataSource.getRepository(Report).create({
        appointment: futureAppointment,
        patient,
        doctor,
        structure: structureA,
        diagnosis: 'Bozza preesistente',
        status: 'draft',
      }),
    );
    await expect(reportService.publish(doctorUser.id, futureDraft.id)).rejects.toMatchObject({
      status: 409,
      code: 'VISIT_NOT_STARTED',
    } satisfies Partial<AppError>);
  });

  test('PDF attachments are verified, replaced atomically and published transactionally', async () => {
    const appointment = await createAppointment(
      patient2,
      doctor,
      new Date(Date.now() - 2 * 60 * 60_000),
      'booked',
      true,
    );
    const invalid = pdfFile('not-really.pdf');
    invalid.buffer = Buffer.from('plain text');
    invalid.size = invalid.buffer.length;
    await expect(
      reportService.create(doctorUser.id, appointment.id, { diagnosis: 'Diagnosi' }, invalid),
    ).rejects.toMatchObject({ status: 400, code: 'ATTACHMENT_NOT_PDF' });

    const report = await reportService.create(
      doctorUser.id,
      appointment.id,
      { diagnosis: 'Diagnosi iniziale' },
      pdfFile('primo.pdf', 'first'),
    );
    const firstPath = report.attachmentPath!;
    await expect(fs.promises.access(firstPath)).resolves.toBeUndefined();

    const replaced = await reportService.update(
      doctorUser.id,
      report.id,
      { diagnosis: 'Diagnosi aggiornata' },
      pdfFile('secondo.pdf', 'second'),
    );
    expect(replaced.attachmentPath).not.toBe(firstPath);
    await expect(fs.promises.access(firstPath)).rejects.toBeDefined();
    await expect(fs.promises.access(replaced.attachmentPath!)).resolves.toBeUndefined();

    const attachment = await reportService.attachment(report.id, doctorUser.id, 'doctor');
    expect(attachment.downloadName).toMatch(/^referto-\d{4}-\d{2}-\d{2}\.pdf$/);

    const published = await reportService.publish(doctorUser.id, report.id);
    expect(published.status).toBe('published');
    const completed = await AppDataSource.getRepository(Appointment).findOneByOrFail({ id: appointment.id });
    expect(completed).toMatchObject({ status: 'completed', clinicalDataAccessGranted: false });
  });

  test('retention constraints prevent deleting a patient referenced by clinical history', async () => {
    await expect(AppDataSource.getRepository(Patient).delete(patient.id)).rejects.toBeDefined();
    await expect(AppDataSource.getRepository(Patient).findOneBy({ id: patient.id })).resolves.not.toBeNull();
  });

  test('list endpoints paginate and reject invalid windows', async () => {
    const firstPage = await fetch(`${baseUrl}/api/v1/structures?page=1&pageSize=1`);
    const body = await firstPage.json() as { items: unknown[]; total: number; page: number; pageSize: number };
    expect(firstPage.status).toBe(200);
    expect(body).toMatchObject({ total: 2, page: 1, pageSize: 1 });
    expect(body.items).toHaveLength(1);

    const invalid = await fetch(`${baseUrl}/api/v1/structures?page=0&pageSize=101`);
    expect(invalid.status).toBe(400);
    expect((await invalid.json()) as object).toMatchObject({ code: 'PAGINATION_INVALID' });
  });

  test('health, readiness, metrics, request ids and CORS are observable and enforced', async () => {
    const health = await fetch(`${baseUrl}/health`, { headers: { 'x-request-id': 'integration-check' } });
    expect(health.status).toBe(200);
    expect(health.headers.get('x-request-id')).toBe('integration-check');
    expect((await health.json()) as object).toMatchObject({ status: 'ok', service: 'puglia-salute-backend' });

    const ready = await fetch(`${baseUrl}/ready`);
    expect(ready.status).toBe(200);
    expect((await ready.json()) as object).toMatchObject({ status: 'ready', database: 'ok' });

    const metrics = await fetch(`${baseUrl}/metrics`);
    expect(await metrics.text()).toContain('puglia_salute_http_requests_total');

    const blockedOrigin = await fetch(`${baseUrl}/api/v1/structures`, {
      headers: { origin: 'https://example.invalid' },
    });
    expect(blockedOrigin.status).toBe(403);
    expect((await blockedOrigin.json()) as object).toMatchObject({ code: 'CORS_ORIGIN_FORBIDDEN' });
  });

  test('authentication endpoints are rate limited', async () => {
    const statuses: number[] = [];
    for (let attempt = 0; attempt < config.authRateLimitMax + 1; attempt += 1) {
      const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'nobody@example.test', password: 'wrong-password' }),
      });
      statuses.push(response.status);
    }
    expect(statuses).toContain(429);
  });
});
