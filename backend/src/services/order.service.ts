import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/connection.js';
import { getCart, clearCart } from './cart.service.js';
import { reserveSlot, SlotCapacityError } from './slot.service.js';
import { trackEvent } from './analytics.service.js';

export interface CheckoutInput {
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  paymentMethod: 'credit_card' | 'upi' | 'apple_pay' | 'cod' | 'netbanking' | 'rupay' | string;
  paymentDetails?: any;
}

export async function placeOrder(sessionId: string, input: CheckoutInput) {
  // Validate cart
  const cart = await getCart(sessionId);
  if (cart.items.length === 0) {
    const error = new Error('Cannot complete checkout with an empty cart.');
    (error as any).statusCode = 400;
    throw error;
  }

  // Fetch answered steps
  const answersRes = await db.query(
    'SELECT step, payload FROM signup_answers WHERE session_id = $1',
    [sessionId]
  );
  const answers: Record<string, any> = {};
  for (const row of answersRes.rows) {
    answers[row.step] = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
  }

  if (!answers.address) {
    const error = new Error('Delivery address is missing. Please complete step 1.');
    (error as any).statusCode = 400;
    throw error;
  }

  if (!answers.slot || !answers.slot.slotId) {
    const error = new Error('Delivery slot is missing. Please choose a slot in step 2.');
    (error as any).statusCode = 400;
    throw error;
  }

  const slotId = answers.slot.slotId;
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Run checkout in atomic database transaction
  const orderResult = await db.transaction(async (tx) => {
    // 1. Transactional guard: attempt to reserve the delivery slot
    const slotReservation = await reserveSlot(slotId, tx);

    // 2. Save payment step answer into signup_answers
    const paymentPayload = {
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone || '',
      paymentMethod: input.paymentMethod,
      completedAt: new Date().toISOString(),
    };

    await tx.query(
      `INSERT INTO signup_answers (session_id, step, payload, updated_at)
       VALUES ($1, 'payment', $2, CURRENT_TIMESTAMP)
       ON CONFLICT (session_id, step)
       DO UPDATE SET payload = EXCLUDED.payload, updated_at = CURRENT_TIMESTAMP`,
      [sessionId, paymentPayload]
    );

    // 3. Update guest profile in sessions
    await tx.query(
      `UPDATE sessions
       SET guest_name = $1, guest_email = $2, guest_phone = $3, current_step = 'confirmation', updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [input.contactName, input.contactEmail, input.contactPhone || null, sessionId]
    );

    // 4. Create order
    const addressJson = JSON.stringify(answers.address);
    const contactJson = JSON.stringify({
      name: input.contactName,
      email: input.contactEmail,
      phone: input.contactPhone || '',
    });
    const paymentJson = JSON.stringify({
      method: input.paymentMethod,
      transactionId: `TXN-${uuidv4().substring(0, 8).toUpperCase()}`,
      status: 'paid',
    });

    await tx.query(
      `INSERT INTO orders (id, session_id, slot_id, total_amount, delivery_fee, status, delivery_address, contact_info, payment_info, created_at)
       VALUES ($1, $2, $3, $4, $5, 'confirmed', $6, $7, $8, CURRENT_TIMESTAMP)`,
      [
        orderId,
        sessionId,
        slotId,
        cart.total,
        cart.deliveryFee,
        addressJson,
        contactJson,
        paymentJson,
      ]
    );

    // 5. Insert order items
    for (const item of cart.items) {
      await tx.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, product_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.productId, item.quantity, item.price, item.name]
      );
    }

    // 6. Clear session cart
    await tx.query('DELETE FROM cart_items WHERE session_id = $1', [sessionId]);

    return {
      orderId,
      slot: slotReservation,
      totalAmount: cart.total,
      deliveryFee: cart.deliveryFee,
      items: cart.items,
      deliveryAddress: answers.address,
      contactInfo: {
        name: input.contactName,
        email: input.contactEmail,
        phone: input.contactPhone,
      },
      paymentMethod: input.paymentMethod,
    };
  });

  // Track analytics event outside transaction
  await trackEvent(sessionId, 'payment', 'order_placed', {
    orderId,
    total: orderResult.totalAmount,
    itemCount: orderResult.items.length,
    slotId,
  });

  return orderResult;
}

export async function getOrder(orderId: string) {
  const res = await db.query(
    `SELECT o.*, s.label as slot_label, s.date as slot_date, s.start_time, s.end_time
     FROM orders o
     JOIN slots s ON o.slot_id = s.id
     WHERE o.id = $1`,
    [orderId]
  );
  if (res.rowCount === 0) return null;

  const itemsRes = await db.query(
    'SELECT * FROM order_items WHERE order_id = $1',
    [orderId]
  );

  const row = res.rows[0];
  return {
    ...row,
    delivery_address: typeof row.delivery_address === 'string' ? JSON.parse(row.delivery_address) : row.delivery_address,
    contact_info: typeof row.contact_info === 'string' ? JSON.parse(row.contact_info) : row.contact_info,
    payment_info: typeof row.payment_info === 'string' ? JSON.parse(row.payment_info) : row.payment_info,
    items: itemsRes.rows,
  };
}
