import { Response } from 'express';
import { DoctorService } from './doctors.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middlewares/auth';
import { toDoctorDto } from '../../utils/dto';
import { validateBody } from '../../middlewares/validate';
import { CreateDoctorBody, ResourceStatusBody, UpdateDoctorBody } from '../../validation/dtos';
import { mapPage, parsePagination } from '../../utils/pagination';

const service = new DoctorService();

export const list = asyncHandler(async (req, res) => {
  const specializationId = req.query.specializationId as string | undefined;
  const structureId = req.query.structureId as string | undefined;
  const page = await service.list(parsePagination(req.query), { specializationId, structureId });
  res.json(mapPage(page, (doctor) => toDoctorDto(doctor)));
});

export const listAll = [
  authenticate,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const page = await service.listAll(parsePagination(req.query));
    res.json(mapPage(page, (doctor) => toDoctorDto(doctor, true)));
  }),
];

export const get = asyncHandler(async (req, res) => {
  res.json(toDoctorDto(await service.get(req.params.id)));
});

export const create = [
  authenticate,
  authorize('admin'),
  validateBody(CreateDoctorBody),
  asyncHandler(async (req, res) => {
    res.status(201).json(toDoctorDto(await service.create(req.body), true));
  }),
];

export const update = [
  authenticate,
  authorize('admin'),
  validateBody(UpdateDoctorBody),
  asyncHandler(async (req, res) => {
    res.json(toDoctorDto(await service.update(req.params.id, req.body), true));
  }),
];

export const setStatus = [
  authenticate,
  authorize('admin'),
  validateBody(ResourceStatusBody),
  asyncHandler(async (req, res) => {
    res.json(toDoctorDto(await service.setActive(req.params.id, req.body.isActive), true));
  }),
];
