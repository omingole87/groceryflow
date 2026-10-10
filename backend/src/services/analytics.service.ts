import { db } from '../db/connection.js';

export interface FunnelStepMetric {
  step: string;
  name: string;
  count: number;
  conversionFromPrevious: number; // percentage (0-100)
  overallConversion: number; // percentage (0-100)
  dropoffCount: number;
  dropoffRate: number; // percentage (0-100)
}

export interface FunnelOverview {
  totalSessions: number;
  totalOrders: number;
  funnelConversionRate: number;
  steps: FunnelStepMetric[];
  recentEvents: any[];
}

export async function trackEvent(
  sessionId: string,
  step: string,
  eventType: string,
  metadata: any = {}
): Promise<void> {
  try {
    await db.query(
      `INSERT INTO funnel_events (session_id, step, event_type, metadata, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [sessionId, step, eventType, metadata]
    );
  } catch (err) {
    console.error('[Analytics Error] Failed to record event:', err);
  }
}

export async function getFunnelMetrics(): Promise<FunnelOverview> {
  // Total unique sessions
  const sessionsRes = await db.query('SELECT COUNT(DISTINCT id) as total FROM sessions');
  const totalSessions = parseInt(sessionsRes.rows[0]?.total || '0', 10);

  // Sessions with cart items
  const cartSessionsRes = await db.query(
    'SELECT COUNT(DISTINCT session_id) as count FROM cart_items'
  );
  const cartSessions = parseInt(cartSessionsRes.rows[0]?.count || '0', 10);

  // Sessions with address completed
  const addressRes = await db.query(
    "SELECT COUNT(DISTINCT session_id) as count FROM signup_answers WHERE step = 'address'"
  );
  const addressSessions = parseInt(addressRes.rows[0]?.count || '0', 10);

  // Sessions with slot completed
  const slotRes = await db.query(
    "SELECT COUNT(DISTINCT session_id) as count FROM signup_answers WHERE step = 'slot'"
  );
  const slotSessions = parseInt(slotRes.rows[0]?.count || '0', 10);

  // Sessions with payment completed
  const paymentRes = await db.query(
    "SELECT COUNT(DISTINCT session_id) as count FROM signup_answers WHERE step = 'payment'"
  );
  const paymentSessions = parseInt(paymentRes.rows[0]?.count || '0', 10);

  // Sessions with confirmed orders
  const ordersRes = await db.query('SELECT COUNT(DISTINCT session_id) as count FROM orders');
  const totalOrders = parseInt(ordersRes.rows[0]?.count || '0', 10);

  const rawStepCounts = [
    { step: 'session_start', name: '1. Started Browsing', count: Math.max(totalSessions, 1) },
    { step: 'cart_ready', name: '2. Items in Cart', count: Math.min(cartSessions, totalSessions || 1) },
    { step: 'address', name: '3. Address Completed', count: addressSessions },
    { step: 'slot', name: '4. Delivery Slot Picked', count: slotSessions },
    { step: 'payment', name: '5. Profile & Payment Set', count: paymentSessions },
    { step: 'order_confirmed', name: '6. Order Placed', count: totalOrders },
  ];

  const steps: FunnelStepMetric[] = [];
  const baseCount = Math.max(totalSessions, 1);

  for (let i = 0; i < rawStepCounts.length; i++) {
    const current = rawStepCounts[i];
    const prevCount = i === 0 ? baseCount : rawStepCounts[i - 1].count;

    const conversionFromPrevious =
      prevCount > 0 ? Math.min(100, Math.round((current.count / prevCount) * 100)) : 0;
    const overallConversion =
      baseCount > 0 ? Math.min(100, Math.round((current.count / baseCount) * 100)) : 0;
    const dropoffCount = Math.max(0, prevCount - current.count);
    const dropoffRate = prevCount > 0 ? Math.round((dropoffCount / prevCount) * 100) : 0;

    steps.push({
      step: current.step,
      name: current.name,
      count: current.count,
      conversionFromPrevious,
      overallConversion,
      dropoffCount,
      dropoffRate,
    });
  }

  // Recent 25 events
  const eventsRes = await db.query(
    `SELECT e.id, e.session_id, e.step, e.event_type, e.metadata, e.created_at
     FROM funnel_events e
     ORDER BY e.created_at DESC
     LIMIT 25`
  );

  const funnelConversionRate =
    baseCount > 0 ? Math.round((totalOrders / baseCount) * 100) : 0;

  return {
    totalSessions,
    totalOrders,
    funnelConversionRate,
    steps,
    recentEvents: eventsRes.rows,
  };
}
