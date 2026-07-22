import { app } from '../server';
import { db } from '../db';

export default async function handler(req: any, res: any) {
  try {
    // Ensure DB connection attempt or fallback completes
    await db.connect();

    return await new Promise((resolve) => {
      res.on('finish', resolve);
      res.on('close', resolve);
      res.on('error', (err: any) => {
        console.error('[Serverless Response Error]:', err);
        resolve(null);
      });

      // Delegate request processing to Express application
      app(req, res);
    });
  } catch (err: any) {
    console.error('[Serverless Fatal Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        route: req?.url || req?.originalUrl || '/api',
        error: err?.message || 'Serverless Execution Error',
        stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined
      });
    }
  }
}

