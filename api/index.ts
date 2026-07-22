import { app } from '../server';
import { db } from '../db';

export default async function handler(req: any, res: any) {
  const startTime = Date.now();
  const rawUrl = req.url || '';

  // Normalize req.url when rewritten by Vercel (e.g., /api/index?path=theme)
  try {
    let targetPath = '';

    if (req.query && req.query.path) {
      const p = Array.isArray(req.query.path) ? req.query.path[0] : req.query.path;
      targetPath = p.startsWith('/') ? p : `/${p}`;
    } else if (rawUrl.includes('?path=')) {
      const match = rawUrl.match(/[?&]path=([^&]+)/);
      if (match) {
        targetPath = decodeURIComponent(match[1]);
        if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;
      }
    } else if (rawUrl.startsWith('/api/index') || rawUrl.startsWith('/api/server')) {
      targetPath = rawUrl.replace(/^\/api\/(index|server)/, '');
    }

    if (targetPath) {
      const normalizedPath = targetPath.startsWith('/api') ? targetPath : `/api${targetPath}`;

      let queryString = '';
      if (req.query) {
        const q = { ...req.query };
        delete q.path;
        const searchParams = new URLSearchParams();
        for (const [key, val] of Object.entries(q)) {
          if (val !== undefined && val !== null) {
            if (Array.isArray(val)) {
              val.forEach(v => searchParams.append(key, String(v)));
            } else {
              searchParams.append(key, String(val));
            }
          }
        }
        queryString = searchParams.toString();
      }

      req.url = `${normalizedPath}${queryString ? `?${queryString}` : ''}`;
    }

    console.log(`[Vercel Serverless Invocation] Original: ${rawUrl} -> Normalized: ${req.url}`);
  } catch (normErr) {
    console.error('[URL Normalization Error]:', normErr);
  }

  try {
    // Ensure DB connection attempt or fallback completes
    await db.connect();

    return await new Promise((resolve) => {
      let isResolved = false;
      const safeResolve = () => {
        if (!isResolved) {
          isResolved = true;
          console.log(`[Vercel Request Completed] ${req.method} ${req.url} (${Date.now() - startTime}ms)`);
          resolve(null);
        }
      };

      res.on('finish', safeResolve);
      res.on('close', safeResolve);
      res.on('error', (err: any) => {
        console.error('[Serverless Response Error]:', err);
        safeResolve();
      });

      // Delegate request processing to Express application
      app(req, res);
    });
  } catch (err: any) {
    console.error('[Serverless Fatal Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        route: req?.url || rawUrl || '/api',
        error: err?.message || 'Serverless Execution Error',
        stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined
      });
    }
  }
}



