import type Koa from 'koa';
import {log} from './logger.js';
import {ObjectId, type WithId} from 'mongodb';
import type {DbPattern, DbProgress, Pattern, ProgressDto} from './types.js';

export function toError(error: Error | undefined) {
  return {
    name: error?.name,
    message: error?.message,
    stack: error?.stack
  }
}

export async function traceHeaders(koa: Koa.Context, next: Koa.Next) {
  // Only log essential headers and sanitize body to avoid serialization issues
  const sanitizedHeaders: Record<string, string | string[] | undefined> = {
    'content-type': koa.request.headers['content-type'],
    'authorization': koa.request.headers['authorization'] ? '[REDACTED]' : undefined,
  };

  // Safely log body - skip if it's a buffer or large object
  let bodyLog: unknown;
  if (koa.request.body) {
    if (Buffer.isBuffer(koa.request.body)) {
      bodyLog = '[Buffer]';
    } else if (typeof koa.request.body === 'object') {
      // Only log the keys for large objects
      bodyLog = Object.keys(koa.request.body);
    } else {
      bodyLog = koa.request.body;
    }
  }

  log.info({
    method: koa.request.method,
    url: koa.request.url,
    headers: sanitizedHeaders,
    bodyKeys: bodyLog
  })
  await next();
}

export function validateId(id: string | undefined): {
  valid: boolean, message: string | null
} {
  if (!id) {
    return {
      valid: false,
      message: 'Pattern ID is required'
    }
  }
  if (!ObjectId.isValid(id)) {
    return {
      valid: false,
      message: 'Invalid pattern ID'
    }
  }
  return {
    valid: true,
    message: null
  }
}

export function toPatternResponse(pattern: WithId<DbPattern>): Pattern {
  return {
    _id: pattern._id.toHexString(),
    name: pattern.name,
    rows: pattern.rows,
    cols: pattern.cols,
    cells: pattern.cells,
    sectionRowInterval: pattern.sectionRowInterval ?? 0,
    sectionColInterval: pattern.sectionColInterval ?? 0,
    createdAt: pattern.createdAt.toISOString(),
    updatedAt: pattern.updatedAt.toISOString(),
  }
}

export function toProgressResponse(progress: WithId<DbProgress>): ProgressDto {
  return {
    _id: progress._id.toHexString(),
    highlightedCells: progress.highlightedCells,
    updatedAt: progress.updatedAt.toISOString(),
  };
}
