import { Errors } from './errors';

export interface PageRequest {
  page: number;
  pageSize: number;
}

export interface Page<T> extends PageRequest {
  items: T[];
  total: number;
  totalPages: number;
}

export function parsePagination(query: Record<string, unknown>): PageRequest {
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 25);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100)
    throw Errors.badRequest('page deve essere >= 1 e pageSize tra 1 e 100', 'PAGINATION_INVALID');
  return { page, pageSize };
}

export function toPage<T>([items, total]: [T[], number], request: PageRequest): Page<T> {
  return {
    items,
    total,
    page: request.page,
    pageSize: request.pageSize,
    totalPages: total === 0 ? 0 : Math.ceil(total / request.pageSize),
  };
}

export function pageWindow(request: PageRequest) {
  return { skip: (request.page - 1) * request.pageSize, take: request.pageSize };
}

export function mapPage<T, U>(page: Page<T>, mapper: (item: T) => U): Page<U> {
  return { ...page, items: page.items.map(mapper) };
}
