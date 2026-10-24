import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApiApp } from './server/api-app.ts';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createApiApp();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // In development, hook up Vite dev server middlewares
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // In production, serve static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ClimateLens] Server listening on http://0.0.0.0:${PORT}`);
    console.log(`[ClimateLens] Evidence-to-Action Integrity Loop active.`);
  });
}

startServer().catch((err) => {
  console.error('[ClimateLens] Failed to start server:', err);
  process.exit(1);
});
