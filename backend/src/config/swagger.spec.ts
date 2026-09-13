import SwaggerParser from '@apidevtools/swagger-parser';
import { swaggerSpec } from './swagger';

describe('OpenAPI contract', () => {
  test('is a valid OpenAPI document and exposes the guarded contracts', async () => {
    await expect(SwaggerParser.validate(swaggerSpec as never)).resolves.toBeDefined();

    const document = swaggerSpec as {
      paths?: Record<string, unknown>;
      components?: { schemas?: Record<string, unknown> };
    };
    expect(document.paths).toHaveProperty('/api/v1/appointments');
    expect(document.paths).toHaveProperty('/api/v1/reports/{id}/publish');
    expect(document.components?.schemas).toHaveProperty('CreateReview');
    expect(document.components?.schemas).toHaveProperty('Page');
  });
});
