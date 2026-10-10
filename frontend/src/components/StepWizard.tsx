import React from 'react';
import {
  MapPin,
  Clock,
  CreditCard,
  Check,
  ShoppingBag,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useGroceryFlow, type StepKey } from '../context/GroceryFlowContext';
import { Step1Address } from './steps/Step1Address';
import { Step2Slot } from './steps/Step2Slot';
import { Step3Payment } from './steps/Step3Payment';
import { StepSuccess } from './steps/StepSuccess';

export const StepWizard: React.FC = () => {
  const { session, activeStep, setActiveStep, cart, setView } = useGroceryFlow();

  const stepsMeta: { id: StepKey; title: string; icon: React.ElementType }[] = [
    { id: 'address', title: '1. Address', icon: MapPin },
    { id: 'slot', title: '2. Delivery Slot', icon: Clock },
    { id: 'payment', title: '3. Payment', icon: CreditCard },
  ];

  const completedSteps = session?.flowState?.completedSteps || [];

  const handleStepClick = (stepId: StepKey) => {
    // Only allow clicking if the step is completed or is the current active step
    const stepIndex = stepsMeta.findIndex((s) => s.id === stepId);
    if (stepIndex <= completedSteps.length) {
      setActiveStep(stepId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Return to shop link */}
      <div className="mb-4">
        <button
          onClick={() => setView('catalog')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping Catalog</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Wizard Area (7 or 8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stepper Progress Header */}
          {activeStep !== 'confirmation' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="grid grid-cols-3 gap-2">
                {stepsMeta.map((s, idx) => {
                  const isCurrent = activeStep === s.id;
                  const isDone = completedSteps.includes(s.id);
                  const isClickable = idx <= completedSteps.length;

                  return (
                    <button
                      key={s.id}
                      onClick={() => handleStepClick(s.id)}
                      disabled={!isClickable}
                      className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-2.5 px-2 rounded-xl text-xs font-bold transition ${
                        isCurrent
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : isDone
                          ? 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                          : 'text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <span className="truncate">{s.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Server-persistence indicator badge */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Server-Persisted State: Refresh-proof</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Step {completedSteps.length + 1} of 3
                </span>
              </div>
            </div>
          )}

          {/* Active Step Container */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            {activeStep === 'address' && <Step1Address />}
            {activeStep === 'slot' && <Step2Slot />}
            {activeStep === 'payment' && <Step3Payment />}
            {activeStep === 'confirmation' && <StepSuccess />}
          </div>
        </div>

        {/* Sidebar Order Recap (4 columns) */}
        {activeStep !== 'confirmation' && (
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Order Summary ({cart.itemCount})
                  </h3>
                </div>
                <button
                  onClick={() => setView('catalog')}
                  className="text-[11px] font-semibold text-emerald-600 hover:underline"
                >
                  Edit Cart
                </button>
              </div>

              {/* Items List */}
              {cart.items.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <p>Your cart is empty.</p>
                  <button
                    onClick={() => setView('catalog')}
                    className="mt-2 text-emerald-600 font-bold hover:underline"
                  >
                    Add some groceries first
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-bold text-slate-700">{item.quantity}x</span>
                        <span className="text-slate-800 truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 flex-shrink-0 ml-2">
                        ₹{item.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span>
                    {cart.deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `₹${cart.deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Due</span>
                  <span className="text-emerald-700">₹{cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Why GroceryFlow Box */}
            <div className="bg-emerald-50/70 rounded-2xl border border-emerald-100 p-4 text-xs space-y-2 text-emerald-950">
              <h4 className="font-bold flex items-center space-x-1.5 text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Churn Guarantee</span>
              </h4>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                If you reload, lose connection, or close this tab, everything you answered is waiting on the server.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
