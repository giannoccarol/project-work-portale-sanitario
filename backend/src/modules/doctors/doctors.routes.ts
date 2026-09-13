import { Router } from 'express';
import * as controller from './doctors.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/doctors:
 *   get:
 *     tags: [Doctors]
 *     summary: Elenco medici (filtra ?specializationId= & ?structureId=)
 *     parameters:
 *       - { in: query, name: specializationId, schema: { type: string } }
 *       - { in: query, name: structureId, schema: { type: string } }
 *     responses:
 *       200: { description: Lista medici }
 *   post:
 *     tags: [Doctors]
 *     summary: Crea medico + utente (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Medico creato }
 */
router.get('/', controller.list);
router.post('/', ...controller.create);
/** @openapi
 * /api/v1/doctors/all:
 *   get: { tags: [Doctors], summary: Elenco inclusi medici archiviati (admin), security: [{ bearerAuth: [] }], responses: { 200: { description: Pagina di medici } } }
 */
router.get('/all', ...controller.listAll);

/**
 * @openapi
 * /api/v1/doctors/{id}:
 *   get:
 *     tags: [Doctors]
 *     summary: Dettaglio medico
 *     responses:
 *       200: { description: Medico }
 *   put:
 *     tags: [Doctors]
 *     summary: Aggiorna medico (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Medico aggiornato }
 */
router.get('/:id', controller.get);
router.put('/:id', ...controller.update);
/** @openapi
 * /api/v1/doctors/{id}/status:
 *   patch:
 *     tags: [Doctors]
 *     summary: Archivia o ripristina medico (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/ResourceStatus' } } } }
 *     responses:
 *       200: { description: Stato aggiornato }
 */
router.patch('/:id/status', ...controller.setStatus);

export default router;
