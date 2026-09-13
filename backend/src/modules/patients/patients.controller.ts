import { ReviewService } from '../reviews/reviews.service';
import { PatientService } from './patients.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middlewares/auth';
import { toPatientDto } from '../../utils/dto';
import { toReviewDto } from '../../utils/dto';

const service = new PatientService();
const reviews = new ReviewService();

export const me = [
  authenticate,
  authorize('patient'),
  asyncHandler(async (req, res) => {
    res.json(toPatientDto(await service.getByUser(req.user!.sub), true));
  }),
];

export const myFolder = [
  authenticate,
  authorize('patient'),
  asyncHandler(async (req, res) => {
    const patient = await service.getByUser(req.user!.sub);
    res.json(await service.buildFolder(patient.id, { role: req.user!.role, userId: req.user!.sub }));
  }),
];

export const folder = [
  authenticate,
  authorize('doctor', 'admin'),
  asyncHandler(async (req, res) => {
    res.json(
      await service.buildFolder(req.params.id, {
        role: req.user!.role,
        userId: req.user!.sub,
        appointmentId: req.query.appointmentId as string | undefined,
      }),
    );
  }),
];

export const myReviews = [
  authenticate,
  authorize('patient'),
  asyncHandler(async (req, res) => {
    res.json((await reviews.listByPatient(req.user!.sub)).map(toReviewDto));
  }),
];
