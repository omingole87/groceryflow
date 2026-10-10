import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllSlots,
  reserveSlot,
  resetSlot,
  SlotCapacityError,
} from '../services/slot.service.js';

export const slotRouter = Router();

// GET /api/slots - List all delivery slots with live capacity
slotRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const slots = await getAllSlots();
    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
});

// POST /api/slots/reserve-test - High concurrency reservation test endpoint
slotRouter.post('/reserve-test', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slotId } = req.body;
    if (!slotId) {
      return res.status(400).json({ success: false, error: 'slotId is required' });
    }

    const reserved = await reserveSlot(slotId);
    res.json({
      success: true,
      message: 'Slot reserved successfully',
      data: reserved,
    });
  } catch (err: any) {
    if (err instanceof SlotCapacityError) {
      return res.status(409).json({
        success: false,
        error: err.message,
        code: 'SLOT_CAPACITY_EXCEEDED',
      });
    }
    next(err);
  }
});

// POST /api/slots/:slotId/reset - Reset capacity for demo
slotRouter.post('/:slotId/reset', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slotId } = req.params;
    const { capacityUsed = 0 } = req.body;
    await resetSlot(slotId as string, capacityUsed);
    const slots = await getAllSlots();
    res.json({ success: true, message: 'Slot reset', data: slots });
  } catch (err) {
    next(err);
  }
});
