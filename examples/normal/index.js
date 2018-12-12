const Koa = require('koa');
const app = new Koa();

app.use(async function (ctx) {
  // throw new Error('hello');
  ctx.body = 'body';
})

app.listen(9000);