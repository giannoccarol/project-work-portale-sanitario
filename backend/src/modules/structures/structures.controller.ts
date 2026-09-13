import { Response } from 'express';
import { StructureService } from './structures.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middlewares/auth';
import { validateBody } from '../../middlewares/validate';
import { CreateStructureBody, ResourceStatusBody, UpdateStructureBody } from '../../validation/dtos';
import { parsePagination } from '../../utils/pagination';

const service = new StructureService();

export const list = asyncHandler(async (req, res) => {
  res.json(await service.list(parsePagination(req.query)));
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
  validateBody(CreateStructureBody),
  asyncHandler(async (req, res) => {
    res.status(201).json(await service.create(req.body));
  }),
];

export const update = [
  authenticate,
  authorize('admin'),
  validateBody(UpdateStructureBody),
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
