# GroceryFlow 🛒

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Launch%20Web%20App-22c55e?style=for-the-badge&logo=googlechrome&logoColor=white)](https://omingole87.github.io/groceryflow/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PGlite-4169E1?logo=postgresql&logoColor=white)](https://electric-sql.com/docs/intro/pglite)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

> 🚀 **Live Interactive Web App:** [**https://omingole87.github.io/groceryflow/**](https://omingole87.github.io/groceryflow/)  
> **Grocery Delivery Onboarding & Checkout Flow**  
> *Zero upfront friction. Cart works from Step 1. One question per screen. Never lose a partially-completed session.*

---

## 📌 Problem Statement

Grocery signups die when the flow demands everything upfront. Nine mandatory screens before the first cart item means users churn on screen two. 

**GroceryFlow solves this by:**
1. Allowing users to build their cart **immediately from step one** without upfront registration roadblocks.
2. Breaking the onboarding and checkout wizard into **one question per screen** (`Address` → `Delivery Slot` → `Payment`).
3. **Persisting every step server-side** the moment it is answered, making sessions completely **refresh-proof**.
4. Offering an **"Order as guest, complete profile at checkout"** flow.
5. Protecting delivery slot limits with **atomic database concurrency guards** (`UPDATE ... WHERE capacity_used < capacity`).
6. Tracking **analytics events at every step** to measure funnel completion and drop-off rates in real time.

---

## 🛠️ Stack & Architecture

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, TypeScript (`tsx`)
- **Database:** PostgreSQL (with embedded persistent `@electric-sql/pglite` out-of-the-box, or external PostgreSQL via `DATABASE_URL`)
- **State Machine:** Pure functional state machine in `steps.ts` where progress is always derived from server-persisted answers.

---

## 🏗️ Core Architecture & Requirements Implementation

### 1. Data Model (`schema.sql`)
- `sessions(id, user_id, is_guest, current_step, guest_name, guest_email, guest_phone, created_at, updated_at)`
- `signup_answers(id, session_id, step, payload, created_at, updated_at)`: One row per answered step, upserted via `ON CONFLICT (session_id, step) DO UPDATE`.
- `slots(id, date, start_time, end_time, label, capacity, capacity_used, is_active)`
- `products(id, name, category, price, image_url, unit, stock)`
- `cart_items(id, session_id, product_id, quantity, unit_price)`
- `orders(id, session_id, slot_id, total_amount, delivery_fee, status, delivery_address, contact_info, payment_info)`
- `order_items(id, order_id, product_id, quantity, unit_price, product_name)`
- `funnel_events(id, session_id, step, event_type, metadata, created_at)`

### 2. State Machine (`steps.ts`)
The server evaluates all answered steps recorded in `signup_answers`:
```typescript
export function nextStep(answers: Record<string, any>): FlowState {
  for (const step of STEPS) {
    if (!step.isAnswered(answers[step.id])) {
      return { currentStep: step.id, ... };
    }
  }
  return { currentStep: 'confirmation', ... };
}
```
The frontend queries the server upon loading or refresh and sets its active view from the server's canonical determination. Refreshing or switching devices restores the exact step and answers.

### 3. Concurrency-Guarded Slot Reservation
To prevent race conditions where two concurrent users grab the last available slot, the system uses an atomic SQL update under PostgreSQL's row-level lock:
```sql
UPDATE slots
SET capacity_used = capacity_used + 1
WHERE id = $1 AND capacity_used < capacity
RETURNING *;
```
If `capacity_used >= capacity`, PostgreSQL evaluates the `WHERE` condition to false and updates 0 rows (`rowCount === 0`). The transaction then rolls back and responds with `HTTP 409 Conflict (SLOT_CAPACITY_EXCEEDED)`.

### 4. Step-by-Step Wizard
- **Screen 1 (Address):** Street Address, Unit, City, State, ZIP code, Delivery Instructions.
- **Screen 2 (Delivery Slot):** Real-time slot picker displaying used/total capacity, "X spots left" warnings, and "SOLD OUT" lockouts.
- **Screen 3 (Guest Profile & Payment):** Name, Email, Phone, and choice of Card, UPI, Apple Pay, or Cash on Delivery. Cart summary is always visible.
- **Order Confirmation:** Receipt, delivery window, and funnel conversion confirmation.

### 5. Measurable Funnel Analytics
Calculates:
- `Total Sessions`
- `Items in Cart`
- `Step 1 (Address Completed)`
- `Step 2 (Slot Picked)`
- `Step 3 (Profile & Payment Set)`
- `Order Confirmed`
- Step-to-step drop-off counts and percentages.
- Overall Funnel Conversion Rate `%`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
From the project root:
```bash
# Install root orchestration packages
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Running the App
Run both backend and frontend concurrently:
```bash
npm run dev
```
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:4000](http://localhost:4000)

---

## 🧪 Testing the Concurrency Guard

Run the automated 25-thread stress test against a slot with capacity = 20:
```bash
npm run test:concurrency
```
**Expected Output:**
```
============================================================
  GroceryFlow Concurrency Test: Slot Capacity Guard
============================================================
Total Concurrent Requests: 25
Slot Maximum Capacity:    20
Successful Bookings:      20
Rejected (409 Guarded):   5
Final Database Count:     20 / 20
✅ TEST PASSED: No overbooking! Atomic SQL guard successfully protected capacity.
```

You can also test this interactively in the web app by clicking the **"Slot Guard"** button in the header navigation!

---

## 📊 Live Interactive Features in UI

1. **Shop Groceries Instantly:** Add avocados, milk, bread, spinach directly to your cart without signing up.
2. **Session Persistence:** Refresh the browser or copy your Session ID to open it in another tab—the state resumes seamlessly.
3. **One Question Per Screen:** Step through Address → Slot → Payment with instant auto-save.
4. **Funnel Analytics Modal:** Click the **"Funnel"** button in the top navigation to view live conversion rates, drop-offs, and raw event streams.
5. **Interactive Slot Concurrency Runner:** Click the **"Slot Guard"** button to stress-test 25 simultaneous reservations in real time.
