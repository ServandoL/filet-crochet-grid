import type Koa from 'koa';
import {log} from './logger.js';
import {ObjectId, type WithId} from 'mongodb';
import type {DbPattern, Pattern} from './types.js';

export function toError(error: Error | undefined) {
  return {
    name: error?.name,
    message: error?.message,
    stack: error?.stack
  }
}

export async function traceHeaders(koa: Koa.Context, next: Koa.Next) {
  log.info({
    headers: koa.request.headers,
    body: koa.request.body
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
    createdAt: pattern.createdAt.toISOString(),
    updatedAt: pattern.updatedAt.toISOString(),
  }
}
