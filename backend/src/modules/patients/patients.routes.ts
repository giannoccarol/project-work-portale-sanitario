import { Router } from 'express';
import * as controller from './patients.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/patients/me:
 *   get:
 *     tags: [Patients]
 *     summary: Profilo del paziente autenticato
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profilo paziente }
 * /api/v1/patients/me/folder:
 *   get:
 *     tags: [Patients]
 *     summary: Cartella clinica del paziente autenticato
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cartella clinica }
 * /api/v1/patients/{id}/folder:
 *   get:
 *     tags: [Patients]
 *     summary: Cartella clinica di un paziente (medico con contesto visita o admin; sezioni protette bloccate senza consenso)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *       - { in: query, name: appointmentId, description: Obbligatorio per il medico, schema: { type: string } }
 *     responses:
 *       200: { description: Cartella clinica filtrata secondo ruolo e consenso }
 */
router.get('/me', ...controller.me);
router.get('/me/folder', ...controller.myFolder);
router.get('/:id/folder', ...controller.folder);

export default router;
