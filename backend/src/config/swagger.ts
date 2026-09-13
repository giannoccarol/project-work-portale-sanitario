import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

export const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Puglia Salute - API del portale sanitario',
      version: '1.0.0',
      description:
        'API RESTful del portale dimostrativo per strutture, professionisti, prenotazioni, cartella clinica e referti della rete sanitaria pugliese.',
    },
    servers: [{ url: `http://localhost:${config.port}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiError: {
          type: 'object',
          required: ['code', 'error'],
          properties: {
            code: { type: 'string', example: 'SLOT_UNAVAILABLE' },
            error: { type: 'string', example: 'Lo slot selezionato non e disponibile' },
          },
        },
        RegisterPatient: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'fiscalCode', 'birthDate', 'structureId'],
          properties: {
            email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 },
            firstName: { type: 'string' }, lastName: { type: 'string' },
            fiscalCode: { type: 'string', minLength: 16, maxLength: 16 },
            birthDate: { type: 'string', format: 'date' }, structureId: { type: 'string', format: 'uuid' },
          },
        },
        BookAppointment: {
          type: 'object', required: ['doctorId', 'startTime'],
          properties: { doctorId: { type: 'string', format: 'uuid' }, startTime: { type: 'string', format: 'date-time' }, reason: { type: 'string' } },
        },
        ClinicalAccess: {
          type: 'object', required: ['granted'], properties: { granted: { type: 'boolean' } },
        },
        CreateReview: {
          type: 'object',
          additionalProperties: false,
          required: ['appointmentId', 'rating'],
          properties: {
            appointmentId: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string', maxLength: 2000 },
          },
        },
        ReportInput: {
          type: 'object',
          additionalProperties: false,
          required: ['diagnosis'],
          properties: {
            diagnosis: { type: 'string', minLength: 1, maxLength: 10000 },
            prescriptions: { type: 'string', maxLength: 10000 },
            notes: { type: 'string', maxLength: 10000 },
          },
        },
        ResourceStatus: {
          type: 'object', required: ['isActive'], properties: { isActive: { type: 'boolean' } },
        },
        Page: {
          type: 'object',
          required: ['items', 'total', 'page', 'pageSize', 'totalPages'],
          properties: {
            items: { type: 'array', items: {} },
            total: { type: 'integer', minimum: 0 },
            page: { type: 'integer', minimum: 1 },
            pageSize: { type: 'integer', minimum: 1, maximum: 100 },
            totalPages: { type: 'integer', minimum: 0 },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./dist/modules/**/*.js', './src/modules/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
