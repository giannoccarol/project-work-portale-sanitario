import { Response } from 'express';
import { SpecializationService } from './specializations.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middlewares/auth';
import { validateBody } from '../../middlewares/validate';
import { CreateSpecializationBody, ResourceStatusBody, UpdateSpecializationBody } from '../../validation/dtos';
import { parsePagination } from '../../utils/pagination';

const service = new SpecializationService();

export const list = asyncHandler(async (req, res) => {
  const structureId = req.query.structureId as string | undefined;
  res.json(await service.list(parsePagination(req.query), structureId));
});

export const listAll = [
  authenticate,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    res.json(await service.listAll(parsePagination(req.query)));
  }),
];

export const get = asyncHandler(async (req, res) => {
  res.json(await service.get(req.params.id));
});

export const create = [
  authenticate,
  authorize('admin'),
  validateBody(CreateSpecializationBody),
  asyncHandler(async (req, res) => {
    res.status(201).json(await service.create(req.body));
  }),
];

export const update = [
  authenticate,
  authorize('admin'),
  validateBody(UpdateSpecializationBody),
  asyncHandler(async (req, res) => {
    res.json(await service.update(req.params.id, req.body));
  }),
];

export const setStatus = [
  authenticate,
  authorize('admin'),
  validateBody(ResourceStatusBody),
  asyncHandler(async (req, res) => {
    res.json(await service.setActive(req.params.id, req.body.isActive));
  }),
];
