import { app } from '../server';
import { db } from '../db';

export default async function handler(req: any, res: any) {
  try {
    await db.connect();
    return app(req, res);
  } catch (err: any) {
    console.error('[Serverless Fatal Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Serverless Execution Error'
      });
    }
  }
}
