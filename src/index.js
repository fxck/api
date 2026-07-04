// @ts-check
import { serve } from '@hono/node-server';
import { API_VERSION } from '@fxck/contracts';
import { app } from './app.js';
import { migrate } from './db.js';

const port = Number(process.env.PORT ?? 3000);

migrate()
  .then(() => {
    serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, (info) => {
      console.log(`api listening on :${info.port} (contract ${API_VERSION})`);
    });
  })
  .catch((err) => {
    console.error('startup migration failed:', err);
    process.exit(1);
  });
