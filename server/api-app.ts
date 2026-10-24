import express, { Express } from 'express';
import apiRouter from './routes/api.routes.ts';

interface ApiAppOptions {
  rewritePathFromQuery?: boolean;
}

export function createApiApp(options: ApiAppOptions = {}): Express {
  const app = express();

  app.use(express.json({ limit: '5mb' }));

  if (options.rewritePathFromQuery) {
    app.use((req, _res, next) => {
      const url = new URL(req.url, 'http://localhost');
      const route = url.searchParams.get('__route');

      if (route) {
        url.searchParams.delete('__route');
        req.url = `/api/${route}${url.search}`;
      }

      next();
    });
  }

  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  return app;
}
