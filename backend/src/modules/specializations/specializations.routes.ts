import { Router } from 'express';
import * as controller from './specializations.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/specializations:
 *   get:
 *     tags: [Specializations]
 *     summary: Elenco specializzazioni (filtra per ?structureId=)
 *     parameters: [{ in: query, name: structureId, schema: { type: string } }]
 *     responses:
 *       200: { description: Lista specializzazioni }
 *   post:
 *     tags: [Specializations]
 *     summary: Crea specializzazione (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Specializzazione creata }
 */
router.get('/', controller.list);
router.post('/', ...controller.create);
/** @openapi
 * /api/v1/specializations/all:
 *   get: { tags: [Specializations], summary: Elenco incluse specializzazioni archiviate (admin), security: [{ bearerAuth: [] }], responses: { 200: { description: Pagina di specializzazioni } } }
 */
router.get('/all', ...controller.listAll);

/**
 * @openapi
 * /api/v1/specializations/{id}:
 *   get:
 *     tags: [Specializations]
 *     summary: Dettaglio specializzazione
 *     responses:
 *       200: { description: Specializzazione }
 *   put:
 *     tags: [Specializations]
 *     summary: Aggiorna (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Specializzazione aggiornata }
 */
router.get('/:id', controller.get);
router.put('/:id', ...controller.update);
/** @openapi
 * /api/v1/specializations/{id}/status:
 *   patch:
 *     tags: [Specializations]
 *     summary: Archivia o ripristina specializzazione (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/ResourceStatus' } } } }
 *     responses:
 *       200: { description: Stato aggiornato }
 */
router.patch('/:id/status', ...controller.setStatus);

export default router;
