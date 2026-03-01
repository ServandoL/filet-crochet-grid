import Koa from 'koa';
import koaBody from 'koa-body';
import Router from '@koa/router'
import {MongoDatabase} from './mongo.js';
import {log} from './logger.js';
import {toError, toPatternResponse, traceHeaders, validateId} from './utils.js';
import cors from '@koa/cors';
import {PatternPatchSchema, PatternSchema} from './zod.schemas.js';
import type {DbPattern} from './types.js';
import {ObjectId, type PushOperator, type UpdateFilter} from 'mongodb';

(async () => {
  const app = new Koa();
  const router = new Router();
  await MongoDatabase.initialize();
  app.use(cors({
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  }));
  app.use(koaBody());
  app.use(traceHeaders);

  router.get('/health', (koa) => {
    koa.status = 200;
    koa.body = {
      message: 'UP'
    }
  })

  router.get('/api/patterns', async (koa) => {
    const patterns = await MongoDatabase.instance.patterns.find().toArray();
    koa.status = 200;
    koa.body = patterns.map(p => toPatternResponse(p));
  });

  router.patch('/api/patterns/:id', async (koa) => {
    const id = koa.params['_id'];
    const isValid = validateId(id);
    if (!isValid.valid) {
      koa.status = 400;
      koa.body = {
        message: isValid.message
      }
    } else {
      try {
        const pattern = PatternPatchSchema.parse(koa.request.body);
        let $set: Partial<DbPattern> = {
          updatedAt: new Date(),
        }
        let $push: PushOperator<DbPattern> = {};
        if (pattern.name) {
          $set = {
            ...$set,
            name: pattern.name
          }
        }
        if (pattern.cells) {
          $set = {
            ...$set,
            cells: pattern.cells
          }
        }
        if (pattern.cells) {
          $push = {
            cells: {
              $each: pattern.cells
            }
          }
        }
        const update: UpdateFilter<DbPattern> = {
          $set,
          $push
        }
        const updateResult = await MongoDatabase.instance.patterns.updateOne(
          {_id: new ObjectId(id)},
          update
        );
        if (updateResult.acknowledged && updateResult.modifiedCount) {
          const updatedPattern = await MongoDatabase.instance.patterns.findOne({_id: new ObjectId(id)});
          koa.status = 200;
          koa.body = updatedPattern ? toPatternResponse(updatedPattern) : null;
        } else {
          log.warn('Failed to update pattern', {id, update});
          koa.status = 500;
          koa.body = {
            message: 'Failed to update pattern. Please try again later.'
          }
        }
      } catch (error) {
        log.warn('Failed to update pattern', toError(error as Error | undefined));
        koa.status = 400;
        koa.body = {
          message: 'Failed to update pattern'
        }
      }
    }

  });

  router.get('/api/patterns/:id', async (koa) => {
    const id = koa.params["id"];
    const isValid = validateId(id);
    if (!isValid.valid) {
      koa.status = 400;
      koa.body = {
        message: isValid.message
      }
    } else {
      const pattern = await MongoDatabase.instance.patterns.findOne({_id: new ObjectId(id)});
      if (pattern) {
        koa.status = 200;
        koa.body = pattern ? toPatternResponse(pattern) : null;
      } else {
        koa.status = 404;
        koa.body = {
          message: 'Pattern not found'
        }
      }
    }
  });

  router.post('/api/patterns', async (koa) => {
    const pattern = koa.request.body;
    if (!pattern || typeof pattern !== 'object') {
      koa.status = 400;
      koa.body = {
        message: 'Invalid pattern data'
      }
    } else {
      try {
        const result = PatternSchema.parse(pattern);
        const insertResult = await MongoDatabase.instance.patterns.insertOne({
          ...result,
          createdAt: new Date(result.createdAt),
          updatedAt: new Date(result.updatedAt)
        });
        if (insertResult.acknowledged && insertResult.insertedId) {
          const createdPattern = await MongoDatabase.instance.patterns.findOne({_id: insertResult.insertedId});
          koa.status = 201;
          koa.body = {
            ...createdPattern,
            _id: insertResult.insertedId.toHexString()
          };
        } else {
          log.warn('Failed to insert pattern', {pattern});
          koa.status = 500;
          koa.body = {
            message: 'Failed to create pattern. Please try again later.'
          }
        }
      } catch (error) {
        log.warn('Failed to create pattern', toError(error as Error | undefined));
        koa.status = 400;
        koa.body = {
          message: 'Failed to create pattern'
        }
      }
    }
  });

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(process.env['PORT'] || 9000, () => {
    log.info('Server is running on port ' + process.env['PORT']);
  });
})().catch(error => {
  log.error({
    location: 'server',
    error: toError(error)
  })
})
