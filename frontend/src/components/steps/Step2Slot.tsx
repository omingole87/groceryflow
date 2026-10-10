import React, { useState } from 'react';
import { Clock, ArrowRight, ArrowLeft, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useGroceryFlow, type DeliverySlot } from '../../context/GroceryFlowContext';

export const Step2Slot: React.FC = () => {
  const { session, slots, saveStepAnswer, setActiveStep } = useGroceryFlow();
  const existingAnswer = session?.answers?.slot || {};

  const [selectedSlotId, setSelectedSlotId] = useState<string>(existingAnswer.slotId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId || !selectedSlot) {
      setErrorMsg('Please choose an available delivery slot.');
      return;
    }

    if (!selectedSlot.isAvailable) {
      setErrorMsg('This slot is fully booked. Please choose another slot.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await saveStepAnswer('slot', {
        slotId: selectedSlot.id,
        label: selectedSlot.label,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to select slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Screen 2 of 3</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Choose Delivery Slot
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time capacity managed by transactional database locks.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {slots.map((slot: DeliverySlot) => {
            const isSelected = selectedSlotId === slot.id;
            const isFull = !slot.isAvailable;
            const percentFilled = Math.round((slot.capacityUsed / slot.capacity) * 100);

            return (
              <div
                key={slot.id}
                onClick={() => {
                  if (!isFull) {
                    setSelectedSlotId(slot.id);
                    setErrorMsg(null);
                  }
                }}
                className={`relative p-4 rounded-2xl border transition-all text-left ${
                  isFull
                    ? 'bg-slate-50/70 border-slate-200 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500 shadow-md cursor-pointer'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm cursor-pointer'
                }`}
              >
                {/* Header of Slot Card */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{slot.startTime} – {slot.endTime}</span>
                    </div>
                    <p className="text-xs text-slate-500">{slot.label}</p>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Capacity Limit Bar & Badge */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
                    <span className="flex items-center space-x-1 text-slate-500">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {slot.capacityUsed} / {slot.capacity} orders
                      </span>
                    </span>

                    {/* Status Badge */}
                    {isFull ? (
                      <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                        SOLD OUT
                      </span>
                    ) : slot.status === 'few_left' ? (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold animate-pulse">
                        Only {slot.remainingCapacity} left!
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Available
                      </span>
                    )}
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isFull
                          ? 'bg-rose-500'
                          : slot.status === 'few_left'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveStep('address')}
            className="flex items-center space-x-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Address</span>
          </button>

          <button
            type="submit"
            disabled={!selectedSlotId || isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-200 transition disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Saving to Server...' : 'Next: Profile & Payment'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
