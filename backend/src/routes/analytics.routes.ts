import { Router, Request, Response, NextFunction } from 'express';
import { getFunnelMetrics, trackEvent } from '../services/analytics.service.js';

export const analyticsRouter = Router();

// GET /api/analytics/funnel - Funnel completion and drop-off metrics
analyticsRouter.get('/funnel', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await getFunnelMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
});

// POST /api/analytics/event - Record custom telemetry event
analyticsRouter.post('/event', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId =
      (req.headers['x-session-id'] as string) || req.body.sessionId || 'anonymous';
    const { step, eventType, metadata } = req.body;

    if (!step || !eventType) {
      return res.status(400).json({ success: false, error: 'step and eventType are required' });
    }

    await trackEvent(sessionId, step, eventType, metadata || {});
    res.json({ success: true, message: 'Event tracked' });
  } catch (err) {
    next(err);
  }
});
