import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/connection.js';
import { nextStep, STEPS, StepKey, FlowState } from '../state-machine/steps.js';
import { trackEvent } from './analytics.service.js';

export interface SessionResponse {
  sessionId: string;
  isGuest: boolean;
  guestName: string | null;
  guestEmail: string | null;
  answers: Record<string, any>;
  flowState: FlowState;
  availableSteps: typeof STEPS;
  cartSummary: {
    itemCount: number;
    subtotal: number;
  };
}

export async function getOrCreateSession(existingSessionId?: string): Promise<SessionResponse> {
  let sessionId = existingSessionId?.trim();
  let sessionRow: any = null;

  if (sessionId) {
    const res = await db.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
    if (res.rowCount > 0) {
      sessionRow = res.rows[0];
    }
  }

  // Create new session if none found
  if (!sessionRow) {
    sessionId = uuidv4();
    await db.query(
      `INSERT INTO sessions (id, is_guest, current_step, created_at, updated_at)
       VALUES ($1, TRUE, 'address', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [sessionId]
    );
    await trackEvent(sessionId, 'onboarding', 'session_start', { userAgent: 'browser' });
  }

  return await getSessionDetails(sessionId!);
}

export async function getSessionDetails(sessionId: string): Promise<SessionResponse> {
  const sessionRes = await db.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
  if (sessionRes.rowCount === 0) {
    throw new Error(`Session ${sessionId} not found`);
  }
  const session = sessionRes.rows[0];

  // Fetch all answered steps
  const answersRes = await db.query(
    'SELECT step, payload FROM signup_answers WHERE session_id = $1 ORDER BY id ASC',
    [sessionId]
  );

  const answers: Record<string, any> = {};
  for (const row of answersRes.rows) {
    answers[row.step] = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
  }

  // Calculate flow state using state machine
  const flowState = nextStep(answers);

  // Sync session current_step in database
  if (session.current_step !== flowState.currentStep) {
    await db.query(
      'UPDATE sessions SET current_step = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [flowState.currentStep, sessionId]
    );
  }

  // Get cart summary
  const cartRes = await db.query(
    `SELECT COALESCE(SUM(quantity), 0) as item_count,
            COALESCE(SUM(quantity * unit_price), 0.00) as subtotal
     FROM cart_items
     WHERE session_id = $1`,
    [sessionId]
  );
  const itemCount = parseInt(cartRes.rows[0].item_count, 10);
  const subtotal = parseFloat(cartRes.rows[0].subtotal);

  return {
    sessionId,
    isGuest: session.is_guest,
    guestName: session.guest_name,
    guestEmail: session.guest_email,
    answers,
    flowState,
    availableSteps: STEPS,
    cartSummary: {
      itemCount,
      subtotal,
    },
  };
}

export async function saveStepAnswer(
  sessionId: string,
  stepId: StepKey,
  payload: any
): Promise<SessionResponse> {
  const stepDef = STEPS.find((s) => s.id === stepId);
  if (!stepDef) {
    throw new Error(`Invalid step: ${stepId}`);
  }

  const validation = stepDef.validate(payload);
  if (!validation.valid) {
    const error = new Error('Validation failed');
    (error as any).validationErrors = validation.errors;
    (error as any).statusCode = 400;
    throw error;
  }

  // Upsert step answer into signup_answers table
  await db.query(
    `INSERT INTO signup_answers (session_id, step, payload, created_at, updated_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT (session_id, step)
     DO UPDATE SET payload = EXCLUDED.payload, updated_at = CURRENT_TIMESTAMP`,
    [sessionId, stepId, payload]
  );

  // If payload contains guest details, update session record
  if (payload.contactName || payload.contactEmail || payload.contactPhone) {
    await db.query(
      `UPDATE sessions
       SET guest_name = COALESCE($1, guest_name),
           guest_email = COALESCE($2, guest_email),
           guest_phone = COALESCE($3, guest_phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [payload.contactName || null, payload.contactEmail || null, payload.contactPhone || null, sessionId]
    );
  }

  // Track analytics event
  await trackEvent(sessionId, stepId, 'step_complete', {
    stepId,
    timestamp: new Date().toISOString(),
  });

  return await getSessionDetails(sessionId);
}

export async function resetSessionAnswers(sessionId: string): Promise<SessionResponse> {
  await db.query('DELETE FROM signup_answers WHERE session_id = $1', [sessionId]);
  await db.query(
    "UPDATE sessions SET current_step = 'address', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
    [sessionId]
  );
  await trackEvent(sessionId, 'flow', 'session_reset', {});
  return await getSessionDetails(sessionId);
}
