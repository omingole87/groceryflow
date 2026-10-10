/**
 * High-Concurrency Slot Reservation Test
 * Proves that the transactional guard:
 *   UPDATE slots SET capacity_used = capacity_used + 1 WHERE id = $1 AND capacity_used < capacity
 * prevents race conditions and overbooking.
 */

import { db } from '../db/connection.js';
import { reserveSlot, SlotCapacityError } from '../services/slot.service.js';

async function runConcurrencyTest() {
  console.log('='.repeat(60));
  console.log('  GroceryFlow Concurrency Test: Slot Capacity Guard');
  console.log('='.repeat(60));

  await db.init();

  const testSlotId = 'test_slot_concurrency';
  const slotCapacity = 20;
  const concurrentAttempts = 25;

  // 1. Setup clean test slot with capacity 20, capacity_used 0
  console.log(`[Setup] Creating test slot '${testSlotId}' with capacity = ${slotCapacity}, capacity_used = 0...`);
  await db.query('DELETE FROM slots WHERE id = $1', [testSlotId]);
  await db.query(
    `INSERT INTO slots (id, date, start_time, end_time, label, capacity, capacity_used, is_active)
     VALUES ($1, CURRENT_DATE, '10:00', '12:00', 'Concurrency Test Slot', $2, 0, TRUE)`,
    [testSlotId, slotCapacity]
  );

  console.log(`[Execution] Firing ${concurrentAttempts} concurrent reservation attempts simultaneously...`);

  const startTime = Date.now();

  // Fire all 25 requests concurrently via Promise.all
  const promises = Array.from({ length: concurrentAttempts }, async (_, index) => {
    const workerId = index + 1;
    try {
      const res = await reserveSlot(testSlotId);
      return { workerId, success: true, capacityUsed: res.capacity_used };
    } catch (err: any) {
      return {
        workerId,
        success: false,
        error: err.message,
        isCapacityError: err instanceof SlotCapacityError || err.statusCode === 409,
      };
    }
  });

  const results = await Promise.all(promises);
  const elapsedMs = Date.now() - startTime;

  // 2. Tally results
  const successfulReservations = results.filter((r) => r.success);
  const rejectedReservations = results.filter((r) => !r.success);

  // 3. Inspect final state in database
  const finalCheck = await db.query('SELECT capacity, capacity_used FROM slots WHERE id = $1', [testSlotId]);
  const finalSlot = finalCheck.rows[0];

  console.log('\n' + '-'.repeat(60));
  console.log('  TEST RESULTS SUMMARY');
  console.log('-'.repeat(60));
  console.log(`Total Concurrent Requests: ${concurrentAttempts}`);
  console.log(`Slot Maximum Capacity:    ${slotCapacity}`);
  console.log(`Successful Bookings:      ${successfulReservations.length}`);
  console.log(`Rejected (409 Guarded):   ${rejectedReservations.length}`);
  console.log(`Final Database Count:     ${finalSlot.capacity_used} / ${finalSlot.capacity}`);
  console.log(`Execution Time:           ${elapsedMs} ms`);
  console.log('-'.repeat(60));

  // Assertions
  const passed =
    successfulReservations.length === slotCapacity &&
    rejectedReservations.length === concurrentAttempts - slotCapacity &&
    finalSlot.capacity_used === slotCapacity;

  if (passed) {
    console.log('✅ TEST PASSED: No overbooking! Atomic SQL guard successfully protected capacity.');
  } else {
    console.error('❌ TEST FAILED: Overbooking detected or mismatch in reservations.');
    process.exitCode = 1;
  }

  // Cleanup
  await db.query('DELETE FROM slots WHERE id = $1', [testSlotId]);
  await db.close();
}

runConcurrencyTest().catch((err) => {
  console.error('[Fatal Test Error]', err);
  process.exit(1);
});
