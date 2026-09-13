import { Response } from 'express';
import { AppointmentService } from './appointments.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middlewares/auth';
import { toAppointmentDto } from '../../utils/dto';
import { validateBody } from '../../middlewares/validate';
import { BookAppointmentBody, ClinicalAccessBody } from '../../validation/dtos';
import { todayInAppTimeZone } from '../../utils/time';
import { mapPage, parsePagination } from '../../utils/pagination';

const service = new AppointmentService();

export const listMine = [
  authenticate,
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    if (req.user!.role === 'patient') res.json(mapPage(await service.listForPatient(req.user!.sub, pagination), toAppointmentDto));
    else if (req.user!.role === 'doctor') res.json(mapPage(await service.listForDoctor(req.user!.sub, pagination), toAppointmentDto));
    else res.json(mapPage(await service.listAll(pagination), toAppointmentDto));
  }),
];

export const listAll = [
  authenticate,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    res.json(mapPage(await service.listAll(parsePagination(req.query)), toAppointmentDto));
  }),
];

export const available = asyncHandler(async (req, res) => {
  const doctorId = req.params.doctorId;
  const date = (req.query.date as string) || todayInAppTimeZone();
  res.json(await service.availableSlots(doctorId, date));
});

export const book = [
  authenticate,
  authorize('patient'),
  validateBody(BookAppointmentBody),
  asyncHandler(async (req, res) => {
    res.status(201).json(toAppointmentDto(await service.book(req.user!.sub, req.body)));
  }),
];

export const cancel = [
  authenticate,
  asyncHandler(async (req, res) => {
    res.json(toAppointmentDto(await service.cancel(req.params.id, req.user!.sub, req.user!.role)));
  }),
];

export const clinicalAccess = [
  authenticate,
  authorize('patient'),
  validateBody(ClinicalAccessBody),
  asyncHandler(async (req, res) => {
    res.json(
      toAppointmentDto(
        await service.setClinicalAccess(req.params.id, req.user!.sub, req.body.granted),
      ),
    );
  }),
];

export const get = [
  authenticate,
  asyncHandler(async (req, res) => {
    res.json(toAppointmentDto(await service.get(req.params.id, req.user!.sub, req.user!.role)));
  }),
];
