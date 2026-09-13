import { Router } from 'express';
import * as controller from './reviews.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Crea una recensione (paziente, dopo una visita completata)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateReview' }
 *     responses:
 *       201: { description: Recensione creata }
 *       400: { description: Body non valido, content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } } }
 *       409: { description: Visita non completata o gia recensita, content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } } }
 */
router.post('/', ...controller.create);

/**
 * @openapi
 * /api/v1/reviews/me:
 *   get:
 *     tags: [Reviews]
 *     summary: Lista recensioni del paziente autenticato
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista recensioni }
 */
router.get('/me', ...controller.mine);

/**
 * @openapi
 * /api/v1/reviews/doctor/{doctorId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Recensioni pubbliche di un medico (con media)
 *     responses:
 *       200: { description: Recensioni e media }
 */
router.get('/doctor/:doctorId', controller.byDoctor);

/**
 * @openapi
 * /api/v1/reviews/appointment/{appointmentId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Recensione relativa a un appuntamento (paziente)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Recensione o null }
 */
router.get('/appointment/:appointmentId', ...controller.byAppointment);

export default router;
