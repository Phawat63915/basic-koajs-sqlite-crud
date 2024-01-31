const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const sqlite3 = require('sqlite3').verbose();

const app = new Koa();
const router = new Router();
app.use(bodyParser());

let db = new sqlite3.Database('mydb.sqlite');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users(id INT, name TEXT)');
});

router.get('/users', async (ctx) => {
  let users = await new Promise((resolve, reject) => {
    db.all('SELECT id, name FROM users', (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
  ctx.body = users;
});

router.post('/users', async (ctx) => {
  let stmt = db.prepare('INSERT INTO users VALUES (?, ?)');
  stmt.run(ctx.request.body.id, ctx.request.body.name);
  stmt.finalize();
  ctx.body = 'User added';
});

router.put('/users/:id', async (ctx) => {
  let stmt = db.prepare('UPDATE users SET name = ? WHERE id = ?');
  stmt.run(ctx.request.body.name, ctx.params.id);
  stmt.finalize();
  ctx.body = 'User updated';
});

router.delete('/users/:id', async (ctx) => {
  let stmt = db.prepare('DELETE FROM users WHERE id = ?');
  stmt.run(ctx.params.id);
  stmt.finalize();
  ctx.body = 'User deleted';
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});