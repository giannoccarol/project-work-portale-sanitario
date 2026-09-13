import { Router } from 'express';
import * as controller from './structures.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/structures:
 *   get:
 *     tags: [Structures]
 *     summary: Elenco delle strutture (tenant)
 *     responses:
 *       200: { description: Lista strutture }
 *   post:
 *     tags: [Structures]
 *     summary: Crea una struttura (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Struttura creata }
 *       403: { description: Non autorizzato }
 */
router.get('/', controller.list);
router.post('/', ...controller.create);
/** @openapi
 * /api/v1/structures/all:
 *   get: { tags: [Structures], summary: Elenco incluse strutture archiviate (admin), security: [{ bearerAuth: [] }], responses: { 200: { description: Pagina di strutture } } }
 */
router.get('/all', ...controller.listAll);

/**
 * @openapi
 * /api/v1/structures/{id}:
 *   get:
 *     tags: [Structures]
 *     summary: Dettaglio struttura
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Struttura }
 *       404: { description: Non trovata }
 *   put:
 *     tags: [Structures]
 *     summary: Aggiorna struttura (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Struttura aggiornata }
 */
router.get('/:id', controller.get);
router.put('/:id', ...controller.update);
/** @openapi
 * /api/v1/structures/{id}/status:
 *   patch:
 *     tags: [Structures]
 *     summary: Archivia o ripristina struttura (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/ResourceStatus' } } } }
 *     responses:
 *       409: { description: Sono presenti dipendenze attive, content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } } }
 */
router.patch('/:id/status', ...controller.setStatus);

export default router;
