import {log} from '../logger.js';
import {toPatternResponse, validateId} from '../utils.js';
import {PatternsService} from '../services/patterns.service.js';
import {PatternPatchSchema, PatternSchema} from '../zod.schemas.js';
import type {UpdatePatternDto} from '../types.js';
import Router from '@koa/router';

export const patternsRouter = new Router();

patternsRouter.delete('/api/patterns/:id', async (koa) => {
  const id = koa.params['id'];
  const isValid = validateId(id);
  if (id && !isValid.valid) {
    koa.status = 400;
    koa.body = {
      message: isValid.message
    }
  } else {
    const deleteResult = await PatternsService.deletePattern(id!);
    if (deleteResult?.acknowledged && deleteResult?.deletedCount) {
      koa.status = 204;
      koa.body = null;
    } else {
      log.warn('Failed to delete pattern', {id});
      koa.status = 500;
      koa.body = {
        message: 'Failed to delete pattern. Please try again later.'
      }
    }
  }
});


patternsRouter.get('/api/patterns', async (koa) => {
  const patterns = await PatternsService.getPatterns();
  koa.status = 200;
  koa.body = patterns.map(p => toPatternResponse(p));
});


patternsRouter.patch('/api/patterns/:id', async (koa) => {
  const id = koa.params['id'];
  const isValid = validateId(id);
  if (!isValid.valid) {
    koa.status = 400;
    koa.body = {
      message: isValid.message
    }
  } else {
    const body: UpdatePatternDto = PatternPatchSchema.parse(koa.request.body);
    const updateResult = await PatternsService.patchPattern(id!, body)
    if (updateResult) {
      koa.status = 200;
      koa.body = toPatternResponse(updateResult);
    } else {
      log.warn('Failed to update pattern', {id, body});
      koa.status = 500;
      koa.body = {
        message: 'Failed to update pattern. Please try again later.'
      }
    }
  }
});

patternsRouter.get('/api/patterns/:id', async (koa) => {
  const id = koa.params["id"];
  const isValid = validateId(id);
  if (!isValid.valid) {
    koa.status = 400;
    koa.body = {
      message: isValid.message
    }
  } else {
    const result = await PatternsService.getPatternById(id!);
    if (result) {
      koa.status = 200;
      koa.body = toPatternResponse(result);
    } else {
      koa.status = 404;
      koa.body = {
        message: 'Pattern not found'
      }
    }
  }
});

patternsRouter.post('/api/patterns', async (koa) => {
    const pattern = koa.request.body;
    if (!pattern || typeof pattern !== 'object') {
      koa.status = 400;
      koa.body = {
        message: 'Invalid pattern data'
      }
    } else {
      const result = PatternSchema.parse(pattern);
      const insertResult = await PatternsService.createPattern(result);
      if (insertResult) {
        koa.status = 201;
        koa.body = {
          ...insertResult,
          _id: insertResult._id.toHexString()
        };
      } else {
        log.warn('Failed to insert pattern', {pattern});
        koa.status = 500;
        koa.body = {
          message: 'Failed to create pattern. Please try again later.'
        }
      }
    }
  }
);

