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
  // Simple approach: stringify headers and body for logging. Use try/catch
  // to avoid throwing on circular structures; fall back to a small note.
  let headersStr: string;
  try {
    // Redact authorization and cookie headers before stringify
    const raw = { ...koa.request.headers } as Record<string, unknown>;
    if (raw['authorization']) raw['authorization'] = '[REDACTED]';
    if (raw['cookie']) raw['cookie'] = '[REDACTED]';
    headersStr = JSON.stringify(raw);
  } catch (e) {
    headersStr = '"[unserializable headers]"';
  }

  let bodyStr: string | undefined = undefined;
  try {
    if (koa.request.body !== undefined) {
      bodyStr = JSON.stringify(koa.request.body);
    }
  } catch (e) {
    bodyStr = '"[unserializable body]"';
  }

  log.info({
    method: koa.request.method,
    url: koa.request.url,
    headers: headersStr,
    body: bodyStr,
  });

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
