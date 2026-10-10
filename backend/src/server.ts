import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { db } from './db/connection.js';
import { seedDatabase } from './db/seed.js';
import { sessionRouter } from './routes/session.routes.js';
import { cartRouter } from './routes/cart.routes.js';
import { slotRouter } from './routes/slot.routes.js';
import { orderRouter } from './routes/order.routes.js';
import { analyticsRouter } from './routes/analytics.routes.js';

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url} (Session: ${req.headers['x-session-id'] || 'none'})`);
  next();
});

// Root handler to fix "Cannot GET /"
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>GroceryFlow API Server</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; margin: 0; line-height: 1.6; }
          .card { max-width: 650px; margin: 0 auto; background: #1e293b; padding: 32px; border-radius: 20px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          h1 { color: #10b981; margin-top: 0; font-size: 24px; display: flex; align-items: center; gap: 8px; }
          .badge { background: #065f46; color: #6ee7b7; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
          a { color: #38bdf8; text-decoration: none; }
          a:hover { text-decoration: underline; }
          ul { list-style: none; padding: 0; margin: 16px 0; }
          li { padding: 10px 0; border-bottom: 1px solid #334155; font-size: 14px; }
          code { background: #0f172a; padding: 3px 8px; border-radius: 6px; color: #f59e0b; font-size: 13px; font-family: monospace; }
          .btn { display: inline-block; background: #10b981; color: #022c22; font-weight: bold; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin-top: 16px; transition: background 0.2s; }
          .btn:hover { background: #34d399; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h1>🛒 GroceryFlow API</h1>
            <span class="badge">ONLINE (Port 4000)</span>
          </div>
          <p>The GroceryFlow backend server is running successfully with PostgreSQL / PGlite.</p>
          <a href="http://localhost:5173" class="btn" target="_blank">Launch Frontend App (http://localhost:5173) &rarr;</a>
          
          <h3 style="margin-top: 28px; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Available API Endpoints:</h3>
          <ul>
            <li><code>GET</code> <a href="/api/health">/api/health</a> &mdash; Health check & uptime</li>
            <li><code>GET</code> <a href="/api/session">/api/session</a> &mdash; Active session state & step machine</li>
            <li><code>GET</code> <a href="/api/cart/products">/api/cart/products</a> &mdash; Grocery product catalog (in INR ₹)</li>
            <li><code>GET</code> <a href="/api/cart">/api/cart</a> &mdash; Session cart items and totals</li>
            <li><code>GET</code> <a href="/api/slots">/api/slots</a> &mdash; Delivery slots with live capacity counts</li>
            <li><code>GET</code> <a href="/api/analytics/funnel">/api/analytics/funnel</a> &mdash; Funnel completion & drop-off metrics</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'GroceryFlow API',
    currency: 'INR',
    symbol: '₹',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/session', sessionRouter);
app.use('/api/cart', cartRouter);
app.use('/api/slots', slotRouter);
app.use('/api/order', orderRouter);
app.use('/api/analytics', analyticsRouter);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.code,
  });
});

async function startServer() {
  try {
    console.log('[GroceryFlow] Starting backend service...');
    await db.init();
    await seedDatabase();

    app.listen(config.port, () => {
      console.log(`[GroceryFlow] Server running on http://localhost:${config.port}`);
      console.log(`[GroceryFlow] Environment: ${config.isProduction ? 'Production' : 'Development'}`);
    });
  } catch (err) {
    console.error('[GroceryFlow] Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
