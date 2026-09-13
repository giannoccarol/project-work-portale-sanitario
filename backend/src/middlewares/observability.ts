import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { config } from '../config/env';

interface MetricValue {
  count: number;
  durationMs: number;
}

const metrics = new Map<string, MetricValue>();

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

function acceptedRequestId(value?: string): string | undefined {
  return value && /^[A-Za-z0-9._-]{1,100}$/.test(value) ? value : undefined;
}

export function observeRequest(req: Request, res: Response, next: NextFunction): void {
  req.requestId = acceptedRequestId(req.header('x-request-id')) || randomUUID();
  res.setHeader('x-request-id', req.requestId);
  const started = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - started) / 1_000_000;
    const key = `${req.method}:${res.statusCode}`;
    const current = metrics.get(key) || { count: 0, durationMs: 0 };
    current.count += 1;
    current.durationMs += durationMs;
    metrics.set(key, current);

    if (config.nodeEnv !== 'test') {
      console.log(JSON.stringify({
        level: 'info',
        event: 'http_request',
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      }));
    }
  });
  next();
}

export function prometheusMetrics(): string {
  const lines = [
    '# HELP puglia_salute_http_requests_total Total HTTP responses.',
    '# TYPE puglia_salute_http_requests_total counter',
    '# HELP puglia_salute_http_request_duration_ms_sum Cumulative HTTP response time.',
    '# TYPE puglia_salute_http_request_duration_ms_sum counter',
  ];
  for (const [key, value] of [...metrics.entries()].sort()) {
    const [method, status] = key.split(':');
    const labels = `method="${method}",status="${status}"`;
    lines.push(`puglia_salute_http_requests_total{${labels}} ${value.count}`);
    lines.push(`puglia_salute_http_request_duration_ms_sum{${labels}} ${value.durationMs.toFixed(3)}`);
  }
  return `${lines.join('\n')}\n`;
}
