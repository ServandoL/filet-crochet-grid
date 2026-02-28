import Koa from 'koa';
import koaBody from 'koa-body';
import Router from '@koa/router'

const app = new Koa();
const router = new Router();

app.use(koaBody());

app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
