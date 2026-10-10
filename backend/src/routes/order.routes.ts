import { Router, Request, Response, NextFunction } from 'express';
import { placeOrder, getOrder } from '../services/order.service.js';
import { SlotCapacityError } from '../services/slot.service.js';

export const orderRouter = Router();

function getSessionId(req: Request): string {
  const id =
    (req.headers['x-session-id'] as string) ||
    (req.query.sessionId as string) ||
    (req.body?.sessionId as string);
  if (!id) {
    throw new Error('x-session-id is required for checkout');
  }
  return id;
}

// POST /api/order/checkout - Place order with atomic slot reservation
orderRouter.post('/checkout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = getSessionId(req);
    const { contactName, contactEmail, contactPhone, paymentMethod } = req.body;

    if (!contactName || !contactEmail || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'contactName, contactEmail, and paymentMethod are required',
      });
    }

    const order = await placeOrder(sessionId, {
      contactName,
      contactEmail,
      contactPhone,
      paymentMethod,
    });

    res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    if (err instanceof SlotCapacityError) {
      return res.status(409).json({
        success: false,
        error: err.message,
        code: 'SLOT_CAPACITY_EXCEEDED',
      });
    }
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    next(err);
  }
});

// GET /api/order/:orderId - Fetch order confirmation
orderRouter.get('/:orderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const order = await getOrder(orderId as string);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});
