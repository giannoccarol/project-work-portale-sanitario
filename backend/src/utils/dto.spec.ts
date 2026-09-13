import { Appointment, Doctor, Patient, Report, Specialization, Structure, User } from '../entities';
import { toAppointmentDto, toReportDto, toPublicUser } from './dto';

function domainFixture() {
  const user = Object.assign(new User(), { id: 'u1', email: 'paziente@example.it', passwordHash: 'secret-hash', role: 'patient', firstName: 'Ada', lastName: 'Rossi' });
  const structure = Object.assign(new Structure(), { id: 's1', name: 'Giovanni XXIII', isActive: true });
  const patient = Object.assign(new Patient(), { id: 'p1', user, structure, fiscalCode: 'RSSDAA90A01A662X', birthDate: '1990-01-01', anamnesi: 'dato sensibile', allergie: 'dato sensibile' });
  const doctorUser = Object.assign(new User(), { id: 'u2', email: 'medico@example.it', passwordHash: 'doctor-hash', role: 'doctor', firstName: 'Luca', lastName: 'Bianchi' });
  const specialization = Object.assign(new Specialization(), { id: 'sp1', name: 'Cardiologia', isActive: true });
  const doctor = Object.assign(new Doctor(), { id: 'd1', user: doctorUser, structure, specialization, isActive: true });
  const appointment = Object.assign(new Appointment(), { id: 'a1', patient, doctor, structure, startTime: new Date('2030-01-01T09:00:00Z'), endTime: new Date('2030-01-01T09:30:00Z'), status: 'booked', clinicalDataAccessGranted: true });
  return { user, patient, doctor, appointment };
}

describe('public DTO mappers', () => {
  it('never serializes passwordHash', () => {
    const { user, appointment } = domainFixture();
    expect(JSON.stringify(toPublicUser(user))).not.toContain('passwordHash');
    expect(JSON.stringify(toAppointmentDto(appointment))).not.toContain('hash');
  });

  it('does not expose clinical notes through appointment DTOs', () => {
    const { appointment } = domainFixture();
    const json = JSON.stringify(toAppointmentDto(appointment));
    expect(json).not.toContain('dato sensibile');
    expect(json).not.toContain('fiscalCode');
  });

  it('exposes attachment presence but never its server path', () => {
    const { appointment, patient, doctor } = domainFixture();
    const report = Object.assign(new Report(), { id: 'r1', appointment, patient, doctor, diagnosis: 'Controllo', status: 'published', attachmentPath: 'C:/private/report.pdf' });
    const dto = toReportDto(report);
    expect(dto.hasAttachment).toBe(true);
    expect(JSON.stringify(dto)).not.toContain('C:/private');
  });
});
