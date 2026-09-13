import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource, initializeDatabase } from './config/data-source';
import { config } from './config/env';
import { swaggerSpec } from './config/swagger';
import authRoutes from './modules/auth/auth.routes';
import structureRoutes from './modules/structures/structures.routes';
import specializationRoutes from './modules/specializations/specializations.routes';
import doctorRoutes from './modules/doctors/doctors.routes';
import appointmentRoutes from './modules/appointments/appointments.routes';
import reportRoutes from './modules/reports/reports.routes';
import reviewRoutes from './modules/reviews/reviews.routes';
import patientRoutes from './modules/patients/patients.routes';
import { AppError } from './utils/errors';
import { observeRequest, prometheusMetrics } from './middlewares/observability';

const app = express();

app.use(observeRequest);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) callback(null, true);
      else callback(new AppError(403, 'Origin non consentita', 'CORS_ORIGIN_FORBIDDEN'));
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/v1/swagger.json', (_req, res) => res.json(swaggerSpec));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'puglia-salute-backend' }));
app.get('/ready', async (_req, res) => {
  try {
    if (!AppDataSource.isInitialized) throw new Error('database not initialized');
    await AppDataSource.query('SELECT 1');
    res.json({ status: 'ready', database: 'ok' });
  } catch {
    res.status(503).json({ code: 'NOT_READY', error: 'Database non disponibile' });
  }
});
app.get('/metrics', (_req, res) => res.type('text/plain; version=0.0.4').send(prometheusMetrics()));

app.use(config.apiBasePath + '/auth', authRoutes);
app.use(config.apiBasePath + '/structures', structureRoutes);
app.use(config.apiBasePath + '/specializations', specializationRoutes);
app.use(config.apiBasePath + '/doctors', doctorRoutes);
app.use(config.apiBasePath + '/appointments', appointmentRoutes);
app.use(config.apiBasePath + '/reports', reportRoutes);
app.use(config.apiBasePath + '/reviews', reviewRoutes);
app.use(config.apiBasePath + '/patients', patientRoutes);

app.use((_req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', error: 'Risorsa non trovata', requestId: _req.requestId });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ code: err.code, error: err.message, requestId: _req.requestId });
  } else if (err.name === 'MulterError') {
    res.status(400).json({ code: 'ATTACHMENT_TOO_LARGE', error: 'L allegato supera il limite di 10 MB', requestId: _req.requestId });
  } else {
    console.error(JSON.stringify({ level: 'error', event: 'request_error', requestId: _req.requestId, name: err.name }));
    res.status(500).json({ code: 'INTERNAL_ERROR', error: 'Errore interno del server', requestId: _req.requestId });
  }
});

export { app };

async function start(): Promise<void> {
  try {
    await initializeDatabase();
    app.listen(config.port, () => {
      console.log(`API in ascolto su http://localhost:${config.port}`);
      console.log(`Swagger UI: http://localhost:${config.port}/api-docs`);
    });
  } catch (err) {
    console.error('Impossibile avviare il server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}
