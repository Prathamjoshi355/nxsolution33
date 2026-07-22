import { app } from '../server';

export default function handler(req: any, res: any) {
  try {
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
