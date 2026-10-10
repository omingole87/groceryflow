import { Router, Request, Response, NextFunction } from 'express';
import {
  getProducts,
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from '../services/cart.service.js';

export const cartRouter = Router();

function getSessionId(req: Request): string {
  const id =
    (req.headers['x-session-id'] as string) ||
    (req.query.sessionId as string) ||
    (req.body?.sessionId as string);
  if (!id) {
    throw new Error('x-session-id is required for cart operations');
  }
  return id;
}

// GET /api/cart/products - Fetch grocery catalog
cartRouter.get('/products', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await getProducts();
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

// GET /api/cart - Get session cart
cartRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = getSessionId(req);
    const cart = await getCart(sessionId);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/items - Add product to cart
cartRouter.post('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = getSessionId(req);
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }
    const cart = await addToCart(sessionId, productId, quantity || 1);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/cart/items/:productId - Update quantity
cartRouter.patch('/items/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = getSessionId(req);
    const { productId } = req.params;
    const { quantity } = req.body;
    if (typeof quantity !== 'number') {
      return res.status(400).json({ success: false, error: 'quantity must be a number' });
    }
    const cart = await updateCartItemQuantity(sessionId, productId as string, quantity);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/items/:productId - Remove item
cartRouter.delete('/items/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = getSessionId(req);
    const { productId } = req.params;
    const cart = await removeFromCart(sessionId, productId as string);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart - Empty cart
cartRouter.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = getSessionId(req);
    await clearCart(sessionId);
    res.json({ success: true, message: 'Cart emptied' });
  } catch (err) {
    next(err);
  }
});
