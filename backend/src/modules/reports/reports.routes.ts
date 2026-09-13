import { Router } from 'express';
import * as controller from './reports.controller';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

/**
 * @openapi
 * /api/v1/reports:
 *   get:
 *     tags: [Reports]
 *     summary: Referti dell'utente (paziente/medico) o tutti (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Pagina di referti, content: { application/json: { schema: { $ref: '#/components/schemas/Page' } } } }
 */
router.get('/', ...controller.listMine);

/**
 * @openapi
 * /api/v1/reports/all:
 *   get:
 *     tags: [Reports]
 *     summary: Tutti i referti (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Pagina di referti, content: { application/json: { schema: { $ref: '#/components/schemas/Page' } } } }
 */
router.get('/all', ...controller.listAll);

/**
 * @openapi
 * /api/v1/reports/{appointmentId}:
 *   post:
 *     tags: [Reports]
 *     summary: Crea referto per un appuntamento (medico) + allegato PDF opzionale
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - { $ref: '#/components/schemas/ReportInput' }
 *               - type: object
 *             properties:
 *               attachment: { type: string, format: binary }
 *     responses:
 *       201: { description: Bozza creata }
 *       400: { description: Diagnosi o PDF non validi, content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } } }
 *       409: { description: Visita futura/non prenotata o referto gia esistente, content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } } }
 */
router.post('/:appointmentId', upload.single('attachment'), ...controller.create);

/**
 * @openapi
 * /api/v1/reports/{id}:
 *   get:
 *     tags: [Reports]
 *     summary: Dettaglio referto
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Referto }
 *   put:
 *     tags: [Reports]
 *     summary: Aggiorna referto (medico proprietario)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - { $ref: '#/components/schemas/ReportInput' }
 *             properties:
 *               attachment: { type: string, format: binary }
 *     responses:
 *       200: { description: Bozza aggiornata }
 */
router.get('/:id', ...controller.get);
router.put('/:id', upload.single('attachment'), ...controller.update);

/**
 * @openapi
 * /api/v1/reports/{id}/publish:
 *   post:
 *     tags: [Reports]
 *     summary: Pubblica il referto (medico proprietario)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Referto pubblicato e appuntamento completato }
 *       409: { description: Referto gia pubblicato o visita non ancora iniziata, content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } } }
 */
router.post('/:id/publish', ...controller.publishHandler);

/**
 * @openapi
 * /api/v1/reports/{id}/download:
 *   get:
 *     tags: [Reports]
 *     summary: Scarica l'allegato PDF del referto
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Allegato PDF, content: { application/pdf: { schema: { type: string, format: binary } } } }
 */
router.get('/:id/download', ...controller.download);

export default router;
