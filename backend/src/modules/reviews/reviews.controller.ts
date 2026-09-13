import { Response } from 'express';
import { ReviewService } from './reviews.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middlewares/auth';
import { toReviewDto } from '../../utils/dto';
import { validateBody } from '../../middlewares/validate';
import { CreateReviewBody } from '../../validation/dtos';

const service = new ReviewService();

export const create = [
  authenticate,
  authorize('patient'),
  validateBody(CreateReviewBody),
  asyncHandler(async (req, res) => {
    res.status(201).json(toReviewDto(await service.create(req.user!.sub, req.body)));
  }),
];

export const byDoctor = asyncHandler(async (req, res) => {
  res.json(await service.listByDoctor(req.params.doctorId));
});

export const mine = [
  authenticate,
  authorize('patient'),
  asyncHandler(async (req, res) => {
    res.json((await service.listByPatient(req.user!.sub)).map(toReviewDto));
  }),
];

export const byAppointment = [
  authenticate,
  authorize('patient'),
  asyncHandler(async (req, res) => {
    const review = await service.byAppointment(req.params.appointmentId, req.user!.sub);
    res.json(review ? toReviewDto(review) : null);
  }),
];
