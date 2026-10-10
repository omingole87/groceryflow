import { db } from '../db/connection.js';
import { trackEvent } from './analytics.service.js';

export interface CartItem {
  id: number;
  productId: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  unit: string;
  quantity: number;
  lineTotal: number;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  freeDeliveryRemaining: number;
  total: number;
}

export async function getProducts() {
  const res = await db.query('SELECT * FROM products ORDER BY category, name ASC');
  return res.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    price: parseFloat(row.price),
    imageUrl: row.image_url,
    unit: row.unit,
    stock: parseInt(row.stock, 10),
  }));
}

export async function getCart(sessionId: string): Promise<CartSummary> {
  const res = await db.query(
    `SELECT c.id, c.product_id, c.quantity, c.unit_price,
            p.name, p.category, p.image_url, p.unit
     FROM cart_items c
     JOIN products p ON c.product_id = p.id
     WHERE c.session_id = $1
     ORDER BY c.created_at ASC`,
    [sessionId]
  );

  let itemCount = 0;
  let subtotal = 0;

  const items: CartItem[] = res.rows.map((row: any) => {
    const qty = parseInt(row.quantity, 10);
    const price = parseFloat(row.unit_price);
    const lineTotal = +(qty * price).toFixed(2);
    itemCount += qty;
    subtotal += lineTotal;

    return {
      id: row.id,
      productId: row.product_id,
      name: row.name,
      category: row.category,
      price,
      imageUrl: row.image_url,
      unit: row.unit,
      quantity: qty,
      lineTotal,
    };
  });

  subtotal = +subtotal.toFixed(2);
  const freeDeliveryThreshold = 499.0;
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0.0 : 49.0;
  const freeDeliveryRemaining = Math.max(0, +(freeDeliveryThreshold - subtotal).toFixed(2));
  const total = +(subtotal + deliveryFee).toFixed(2);

  return {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    freeDeliveryRemaining,
    total,
  };
}

export async function addToCart(
  sessionId: string,
  productId: string,
  quantity = 1
): Promise<CartSummary> {
  const prodRes = await db.query('SELECT price, name FROM products WHERE id = $1', [productId]);
  if (prodRes.rowCount === 0) {
    throw new Error(`Product ${productId} not found`);
  }
  const price = parseFloat(prodRes.rows[0].price);
  const productName = prodRes.rows[0].name;

  await db.query(
    `INSERT INTO cart_items (session_id, product_id, quantity, unit_price, updated_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     ON CONFLICT (session_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, unit_price = EXCLUDED.unit_price, updated_at = CURRENT_TIMESTAMP`,
    [sessionId, productId, quantity, price]
  );

  await trackEvent(sessionId, 'cart', 'cart_add', {
    productId,
    productName,
    addedQuantity: quantity,
  });

  return await getCart(sessionId);
}

export async function updateCartItemQuantity(
  sessionId: string,
  productId: string,
  quantity: number
): Promise<CartSummary> {
  if (quantity <= 0) {
    await db.query('DELETE FROM cart_items WHERE session_id = $1 AND product_id = $2', [
      sessionId,
      productId,
    ]);
  } else {
    await db.query(
      `UPDATE cart_items
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP
       WHERE session_id = $2 AND product_id = $3`,
      [quantity, sessionId, productId]
    );
  }

  return await getCart(sessionId);
}

export async function removeFromCart(sessionId: string, productId: string): Promise<CartSummary> {
  await db.query('DELETE FROM cart_items WHERE session_id = $1 AND product_id = $2', [
    sessionId,
    productId,
  ]);
  return await getCart(sessionId);
}

export async function clearCart(sessionId: string): Promise<void> {
  await db.query('DELETE FROM cart_items WHERE session_id = $1', [sessionId]);
}
