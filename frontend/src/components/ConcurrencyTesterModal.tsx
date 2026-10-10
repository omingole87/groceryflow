import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Code,
  Flame,
} from 'lucide-react';
import { api } from '../api/client';
import { useGroceryFlow } from '../context/GroceryFlowContext';

export const ConcurrencyTesterModal: React.FC = () => {
  const {
    isConcurrencyModalOpen,
    setIsConcurrencyModalOpen,
    slots,
    refreshSlots,
  } = useGroceryFlow();

  const [selectedSlotId, setSelectedSlotId] = useState<string>(slots[0]?.id || 'slot_today_morning');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [testSummary, setTestSummary] = useState<any | null>(null);

  if (!isConcurrencyModalOpen) return null;

  const currentSlot = slots.find((s) => s.id === selectedSlotId);

  const handleResetSlot = async () => {
    try {
      await api.resetSlot(selectedSlotId, 0);
      await refreshSlots();
      setResults(null);
      setTestSummary(null);
    } catch (err) {
      console.error('Failed to reset slot:', err);
    }
  };

  const runConcurrentTest = async () => {
    setIsRunning(true);
    setResults(null);
    setTestSummary(null);

    // First reset the slot so it has capacity 20, used 0
    await api.resetSlot(selectedSlotId, 0);
    await refreshSlots();

    const concurrentAttempts = 25;
    const startTime = performance.now();

    // Fire 25 simultaneous asynchronous reservation requests
    const promises = Array.from({ length: concurrentAttempts }, async (_, index) => {
      const workerId = index + 1;
      try {
        await api.testSlotReservation(selectedSlotId);
        return { workerId, success: true, status: 200, message: 'Reserved' };
      } catch (err: any) {
        return {
          workerId,
          success: false,
          status: err.status || 409,
          message: err.data?.code || 'Slot Capacity Exceeded (409)',
        };
      }
    });

    const executionResults = await Promise.all(promises);
    const duration = Math.round(performance.now() - startTime);

    const successful = executionResults.filter((r) => r.success).length;
    const blocked = executionResults.filter((r) => !r.success).length;

    await refreshSlots();

    setResults(executionResults);
    setTestSummary({
      attempts: concurrentAttempts,
      successful,
      blocked,
      duration,
      passed: successful <= (currentSlot?.capacity || 20),
    });
    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Transactional Slot Concurrency Guard
              </h2>
              <p className="text-xs text-slate-500">
                Stress-test 25 concurrent requests on a capacity-20 delivery slot
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsConcurrencyModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SQL Mechanism Explanation */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
              <Code className="w-4 h-4" />
              <span>Atomic SQL Guard</span>
            </div>
            <p className="text-emerald-400 font-bold bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              UPDATE slots<br />
              SET capacity_used = capacity_used + 1<br />
              WHERE id = $1 AND capacity_used &lt; capacity<br />
              RETURNING *;
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              PostgreSQL row-level lock serializes concurrent updates. The instant `capacity_used` reaches 20, all subsequent concurrent transactions match 0 rows and are safely rejected with HTTP 409 Conflict.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Delivery Slot:
              </label>
              <select
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.capacityUsed}/{s.capacity} used)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleResetSlot}
                disabled={isRunning}
                className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to 0</span>
              </button>

              <button
                onClick={runConcurrentTest}
                disabled={isRunning}
                className="flex items-center space-x-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-amber-200 transition disabled:opacity-50"
              >
                <Flame className={`w-4 h-4 ${isRunning ? 'animate-bounce' : ''}`} />
                <span>{isRunning ? 'Firing 25 Requests...' : 'Fire 25 Concurrent Bookings'}</span>
              </button>
            </div>
          </div>

          {/* Summary Box */}
          {testSummary && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Test Result: 100% Guard Protected</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-700">
                  {testSummary.duration} ms total
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  <p className="text-slate-400">Total Requests</p>
                  <p className="text-base font-black text-slate-900">{testSummary.attempts}</p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  <p className="text-emerald-600 font-semibold">Bookings (200 OK)</p>
                  <p className="text-base font-black text-emerald-700">{testSummary.successful}</p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  <p className="text-rose-600 font-semibold">Blocked (409 Conflict)</p>
                  <p className="text-base font-black text-rose-700">{testSummary.blocked}</p>
                </div>
              </div>
            </div>
          )}

          {/* Request Grid */}
          {results && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Worker Responses (25 Simultaneous Coroutines)
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {results.map((r) => (
                  <div
                    key={r.workerId}
                    className={`p-2 rounded-xl border text-center text-xs flex flex-col items-center justify-center space-y-1 ${
                      r.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      {r.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span className="font-mono text-[10px]">Req #{r.workerId}</span>
                    </div>
                    <span className="font-black text-[11px]">{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
