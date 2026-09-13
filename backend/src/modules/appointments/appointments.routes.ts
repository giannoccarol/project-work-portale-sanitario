import { Router } from 'express';
import * as controller from './appointments.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Appuntamenti dell'utente autenticato (paziente/medico) o tutti (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Pagina di appuntamenti, content: { application/json: { schema: { $ref: '#/components/schemas/Page' } } } }
 *   post:
 *     tags: [Appointments]
 *     summary: Prenota una visita (solo paziente)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/BookAppointment' }
 *     responses:
 *       201: { description: Appuntamento creato }
 *       409: { description: Slot non disponibile, content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } } }
 */
router.get('/', ...controller.listMine);
router.post('/', ...controller.book);

/**
 * @openapi
 * /api/v1/appointments/available/{doctorId}:
 *   get:
 *     tags: [Appointments]
 *     summary: Slot disponibili per un medico in una data (?date=yyyy-mm-dd)
 *     parameters:
 *       - { in: path, name: doctorId, required: true, schema: { type: string } }
 *       - { in: query, name: date, schema: { type: string } }
 *     responses:
 *       200: { description: Lista di date ISO slot }
 */
router.get('/available/:doctorId', controller.available);

/**
 * @openapi
 * /api/v1/appointments/all:
 *   get:
 *     tags: [Appointments]
 *     summary: Tutti gli appuntamenti (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Pagina di appuntamenti, content: { application/json: { schema: { $ref: '#/components/schemas/Page' } } } }
 */
router.get('/all', ...controller.listAll);

/**
 * @openapi
 * /api/v1/appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Dettaglio appuntamento
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Appuntamento }
 *   delete:
 *     tags: [Appointments]
 *     summary: Annulla appuntamento (paziente o medico proprietario)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Appuntamento annullato }
 */
router.get('/:id', ...controller.get);
router.delete('/:id', ...controller.cancel);

/**
 * @openapi
 * /api/v1/appointments/{id}/clinical-access:
 *   patch:
 *     tags: [Appointments]
 *     summary: Concede o revoca l'accesso ai dati clinici per la visita (paziente)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ClinicalAccess' }
 *     responses:
 *       200: { description: Consenso aggiornato }
 *       403: { description: Paziente non proprietario, content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } } }
 */
router.patch('/:id/clinical-access', ...controller.clinicalAccess);

export default router;
