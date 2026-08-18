/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import http from 'http';
import path from 'path';
import fs from 'fs';
import express, { Express } from 'express';
import dotenv from 'dotenv';
import { createApiApp } from './src/server/app';

dotenv.config();

let serverInstance: { app: Express; server: http.Server; port: number } | null = null;
let isStarting = false;

export async function startServer(customPort?: number): Promise<{ app: Express; server: http.Server; port: number }> {
  if (serverInstance) {
    return serverInstance;
  }
  if (isStarting) {
    while (isStarting) {
      await new Promise((r) => setTimeout(r, 100));
      if (serverInstance) return serverInstance;
    }
  }
  isStarting = true;

  try {
    const app = createApiApp();
    const PORT = customPort || (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

    // Vite middleware for development or static serving in production
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      let distPath = path.resolve(__dirname);
      if (!fs.existsSync(path.join(distPath, 'index.html'))) {
        if (fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))) {
          distPath = path.join(process.cwd(), 'dist');
        } else if (fs.existsSync(path.join(__dirname, 'dist', 'index.html'))) {
          distPath = path.join(__dirname, 'dist');
        } else if (fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
          distPath = path.join(__dirname, '..', 'dist');
        }
      }

      console.log('[ZTune Server] Serving static files from:', distPath);
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send('index.html not found');
        }
      });
    }

    const server = http.createServer(app);

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[ZTune Server] Port ${PORT} already active. ZTune will connect to running instance.`);
      } else {
        console.error('[ZTune Server] Server listener error:', err);
      }
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`ZTune Desktop Server running on http://localhost:${PORT}`);
    });

    serverInstance = { app, server, port: PORT };
    isStarting = false;
    return serverInstance;
  } catch (err) {
    isStarting = false;
    throw err;
  }
}

// Auto-start server safely if not already initialized
startServer().catch((err) => {
  if (err?.code === 'EADDRINUSE') {
    console.warn('[ZTune Server] Port already in use on boot.');
  } else {
    console.error('[ZTune Server] Startup notice:', err?.message || err);
  }
});
