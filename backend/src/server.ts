import Koa from 'koa';
import koaBody from 'koa-body';
import Router from '@koa/router'
import {MongoDatabase} from './mongo.js';
import {log} from './logger.js';
import {toError} from './utils.js';
import cors from '@koa/cors';

(async () => {
  const app = new Koa();
  const router = new Router();
  await MongoDatabase.initialize();
  app.use(cors());
  app.use(koaBody());

  router.get('/health', (koa) => {
    koa.status = 200;
    koa.body = {
      message: 'UP'
    }
  })

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(process.env['PORT'] || 9000);
})().catch(error => {
  log.error({
    location: 'server',
    error: toError(error)
  })
})
