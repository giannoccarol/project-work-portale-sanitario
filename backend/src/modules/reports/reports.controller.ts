import { Response } from 'express';
import { ReportService } from './reports.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middlewares/auth';
import { toReportDto } from '../../utils/dto';
import { validateBody } from '../../middlewares/validate';
import { CreateReportBody, UpdateReportBody } from '../../validation/dtos';
import { mapPage, parsePagination } from '../../utils/pagination';

const service = new ReportService();

export const listMine = [
  authenticate,
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    if (req.user!.role === 'patient') res.json(mapPage(await service.listForPatient(req.user!.sub, pagination), toReportDto));
    else if (req.user!.role === 'doctor') res.json(mapPage(await service.listForDoctor(req.user!.sub, pagination), toReportDto));
    else res.json(mapPage(await service.listAll(pagination), toReportDto));
  }),
];

export const listAll = [
  authenticate,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    res.json(mapPage(await service.listAll(parsePagination(req.query)), toReportDto));
  }),
];

export const create = [
  authenticate,
  authorize('doctor'),
  validateBody(CreateReportBody),
  asyncHandler(async (req, res) => {
    res.status(201).json(toReportDto(await service.create(req.user!.sub, req.params.appointmentId, req.body, req.file)));
  }),
];

export const update = [
  authenticate,
  authorize('doctor'),
  validateBody(UpdateReportBody),
  asyncHandler(async (req, res) => {
    res.json(toReportDto(await service.update(req.user!.sub, req.params.id, req.body, req.file)));
  }),
];

export const publishHandler = [
  authenticate,
  authorize('doctor'),
  asyncHandler(async (req, res) => {
    res.json(toReportDto(await service.publish(req.user!.sub, req.params.id)));
  }),
];

export const get = [
  authenticate,
  asyncHandler(async (req, res) => {
    res.json(toReportDto(await service.get(req.params.id, req.user!.sub, req.user!.role)));
  }),
];

export const download = [
  authenticate,
  asyncHandler(async (req, res) => {
    const attachment = await service.attachment(req.params.id, req.user!.sub, req.user!.role);
    res.download(attachment.filePath, attachment.downloadName);
  }),
];
