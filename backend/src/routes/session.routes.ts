import { Router, Request, Response, NextFunction } from 'express';
import {
  getOrCreateSession,
  getSessionDetails,
  saveStepAnswer,
  resetSessionAnswers,
} from '../services/session.service.js';
import { StepKey } from '../state-machine/steps.js';

export const sessionRouter = Router();

function getSessionId(req: Request): string | undefined {
  return (
    (req.headers['x-session-id'] as string) ||
    (req.query.sessionId as string) ||
    (req.body?.sessionId as string) ||
    undefined
  );
}

// GET /api/session - Resume or create session
sessionRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = getSessionId(req);
    const session = await getOrCreateSession(sessionId);
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
});

// POST /api/session/answers - Upsert an answered step
sessionRouter.post('/answers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = getSessionId(req);
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'x-session-id header required' });
    }

    const { step, payload } = req.body;
    if (!step) {
      return res.status(400).json({ success: false, error: 'step parameter is required' });
    }

    const updatedSession = await saveStepAnswer(sessionId, step as StepKey, payload);
    res.json({ success: true, data: updatedSession });
  } catch (err: any) {
    if (err.validationErrors) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        validationErrors: err.validationErrors,
      });
    }
    next(err);
  }
});

// POST /api/session/reset - Reset progress
sessionRouter.post('/reset', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = getSessionId(req);
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'x-session-id header required' });
    }
    const session = await resetSessionAnswers(sessionId);
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
});
