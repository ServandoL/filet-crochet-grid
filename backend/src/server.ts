import Koa from 'koa';
import koaBody from 'koa-body';
import Router from '@koa/router'
import {MongoDatabase} from './mongo.js';
import {log} from './logger.js';
import {toError, traceHeaders} from './utils.js';
import cors from '@koa/cors';
import {patternsRouter} from './controllers/patterns.controller.js';

(async () => {
  const router = new Router();
  const app = new Koa();
  await MongoDatabase.initialize();
  app.use(cors({
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  }));
  app.use(koaBody());
  app.use(traceHeaders);

  app.use(async (koa, next) => {
    try {
      await next();
    } catch (error) {
      log.error({
        location: 'server',
        error: toError(error instanceof Error ? error : undefined)
      })
      koa.status = 500;
      koa.body = {
        message: 'Internal server error. Please try again later.'
      }
    }
  })

  router.get('/health', (koa) => {
    koa.status = 200;
    koa.body = {
      message: 'UP'
    }
  })

  app.use(router.routes()).use(router.allowedMethods());
  app.use(patternsRouter.routes()).use(patternsRouter.allowedMethods());

  app.listen(process.env['PORT'] || 9000, () => {
    log.info('Server is running on port ' + process.env['PORT']);
  });
})().catch(error => {
  log.error({
    location: 'server',
    error: toError(error)
  })
})
