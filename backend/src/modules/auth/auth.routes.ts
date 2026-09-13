import { Router } from 'express';
import * as controller from './auth.controller';
import { authRateLimit } from '../../middlewares/rateLimit';

const router = Router();

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Autenticazione utente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: { email: {type: string}, password: {type: string} }
 *     responses:
 *       200: { description: Token JWT }
 *       401: { description: Credenziali non valide }
 */
router.post('/login', authRateLimit, ...controller.login);

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrazione di un nuovo paziente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/RegisterPatient'
 *     responses:
 *       201: { description: Utente creato }
 *       400: { description: Dati non validi, content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } } }
 *       409: { description: Email gia presente }
 */
router.post('/register', authRateLimit, ...controller.register);

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Profilo dell'utente autenticato
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profilo utente }
 *       401: { description: Non autenticato }
 */
router.get('/me', ...controller.me);

/**
 * @openapi
 * /api/v1/auth/me/password:
 *   patch:
 *     tags: [Auth]
 *     summary: Cambia la password dell'utente autenticato
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: Password aggiornata }
 *       400: { description: Dati non validi }
 *       401: { description: Password attuale errata }
 */
router.patch('/me/password', ...controller.changePassword);

export default router;
