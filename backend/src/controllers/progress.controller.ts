import Router from '@koa/router';
import { log } from '../logger.js';
import { validateId, toProgressResponse } from '../utils.js';
import { ProgressService } from '../services/progress.service.js';
import { UpsertProgressSchema } from '../zod.schemas.js';

export const progressRouter = new Router();

// GET /api/patterns/:id/progress
progressRouter.get('/api/patterns/:id/progress', async (koa) => {
  const id = koa.params['id'];
  const isValid = validateId(id);
  if (!isValid.valid) {
    koa.status = 400;
    koa.body = { message: isValid.message };
    return;
  }
  const result = await ProgressService.getByPatternId(id!);
  if (result) {
    koa.status = 200;
    koa.body = toProgressResponse(result);
  } else {
    koa.status = 404;
    koa.body = { message: 'No progress found for this pattern' };
  }
});

// PUT /api/patterns/:id/progress
progressRouter.put('/api/patterns/:id/progress', async (koa) => {
  const id = koa.params['id'];
  const isValid = validateId(id);
  if (!isValid.valid) {
    koa.status = 400;
    koa.body = { message: isValid.message };
    return;
  }
  const body = UpsertProgressSchema.parse(koa.request.body);
  const result = await ProgressService.upsertByPatternId(id!, body);
  if (result) {
    koa.status = 200;
    koa.body = toProgressResponse(result);
  } else {
    log.warn('Failed to upsert progress', { id });
    koa.status = 500;
    koa.body = { message: 'Failed to save progress. Please try again later.' };
  }
});

// DELETE /api/patterns/:id/progress
progressRouter.delete('/api/patterns/:id/progress', async (koa) => {
  const id = koa.params['id'];
  const isValid = validateId(id);
  if (!isValid.valid) {
    koa.status = 400;
    koa.body = { message: isValid.message };
    return;
  }
  const deleteResult = await ProgressService.deleteByPatternId(id!);
  if (deleteResult !== undefined) {
    // 204 for both successful deletion and idempotent no-op (no progress existed)
    koa.status = 204;
    koa.body = null;
  } else {
    log.warn('Failed to delete progress', { id });
    koa.status = 500;
    koa.body = { message: 'Failed to delete progress. Please try again later.' };
  }
});

