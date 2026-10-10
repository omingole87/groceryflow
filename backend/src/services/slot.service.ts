import { db, TransactionClient } from '../db/connection.js';

export interface DeliverySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  label: string;
  capacity: number;
  capacityUsed: number;
  remainingCapacity: number;
  isAvailable: boolean;
  status: 'available' | 'few_left' | 'full';
}

export class SlotCapacityError extends Error {
  public statusCode = 409;
  constructor(message = 'Selected delivery slot is fully booked. Please choose another time slot.') {
    super(message);
    this.name = 'SlotCapacityError';
  }
}

export async function getAllSlots(): Promise<DeliverySlot[]> {
  const res = await db.query(`
    SELECT id, date, start_time, end_time, label, capacity, capacity_used, is_active
    FROM slots
    WHERE is_active = TRUE
    ORDER BY date ASC, start_time ASC
  `);

  return res.rows.map((row: any) => {
    const capacity = parseInt(row.capacity, 10);
    const capacityUsed = parseInt(row.capacity_used, 10);
    const remaining = Math.max(0, capacity - capacityUsed);
    const isAvailable = remaining > 0;

    let status: 'available' | 'few_left' | 'full' = 'available';
    if (remaining === 0) {
      status = 'full';
    } else if (remaining <= 3) {
      status = 'few_left';
    }

    return {
      id: row.id,
      date: typeof row.date === 'string' ? row.date.split('T')[0] : row.date.toISOString().split('T')[0],
      startTime: row.start_time,
      endTime: row.end_time,
      label: row.label,
      capacity,
      capacityUsed,
      remainingCapacity: remaining,
      isAvailable,
      status,
    };
  });
}

/**
 * Atomically reserves a slot using transactional guard:
 * UPDATE slots SET capacity_used = capacity_used + 1 WHERE id = $1 AND capacity_used < capacity RETURNING *
 */
export async function reserveSlot(slotId: string, txClient?: TransactionClient): Promise<any> {
  const runner = txClient || db;

  const result = await runner.query(
    `UPDATE slots
     SET capacity_used = capacity_used + 1
     WHERE id = $1 AND capacity_used < capacity
     RETURNING *`,
    [slotId]
  );

  if (result.rowCount === 0) {
    // Check if slot exists or was just full
    const check = await runner.query('SELECT capacity, capacity_used FROM slots WHERE id = $1', [slotId]);
    if (check.rowCount === 0) {
      throw new Error(`Delivery slot ${slotId} not found`);
    }
    const { capacity, capacity_used } = check.rows[0];
    throw new SlotCapacityError(
      `Slot is fully booked (${capacity_used}/${capacity} orders reserved). Please select another slot.`
    );
  }

  return result.rows[0];
}

export async function releaseSlot(slotId: string, txClient?: TransactionClient): Promise<void> {
  const runner = txClient || db;
  await runner.query(
    `UPDATE slots
     SET capacity_used = GREATEST(0, capacity_used - 1)
     WHERE id = $1`,
    [slotId]
  );
}

export async function resetSlot(slotId: string, capacityUsed: number = 0): Promise<void> {
  await db.query(
    'UPDATE slots SET capacity_used = $1 WHERE id = $2',
    [capacityUsed, slotId]
  );
}
