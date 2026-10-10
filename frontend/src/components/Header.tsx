import React, { useState } from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  RotateCcw,
  BarChart3,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react';
import { useGroceryFlow } from '../context/GroceryFlowContext';

export const Header: React.FC = () => {
  const {
    session,
    cart,
    view,
    setView,
    setIsCartDrawerOpen,
    setIsAnalyticsOpen,
    setIsConcurrencyModalOpen,
    resetSession,
  } = useGroceryFlow();

  const [copied, setCopied] = useState(false);

  const handleCopySessionId = () => {
    if (session?.sessionId) {
      navigator.clipboard.writeText(session.sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('catalog')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">GroceryFlow</span>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  by OM INGOLE
                </span>
              </div>
              <p className="text-xs text-slate-600 hidden sm:block">
                Designed &amp; Developed by <span className="font-bold text-slate-900">OM INGOLE</span> • 2nd Year IT @ SSGMCE
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setView('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                view === 'catalog'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shop Catalog
            </button>
            <button
              onClick={() => setView('wizard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                view === 'wizard'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Checkout Flow
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Session Resume Pill */}
            {session && (
              <div className="hidden lg:flex items-center space-x-1.5 text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-500 font-mono">
                  ID: {session.sessionId.substring(0, 8)}...
                </span>
                <button
                  onClick={handleCopySessionId}
                  title="Copy Session ID to test resume"
                  className="text-slate-400 hover:text-slate-700 p-0.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Funnel Analytics Button */}
            <button
              onClick={() => setIsAnalyticsOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-lg transition"
              title="View Funnel Conversion & Drop-off Analytics"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Funnel</span>
            </button>

            {/* Concurrency Stress Test Button */}
            <button
              onClick={() => setIsConcurrencyModalOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 px-3 py-1.5 rounded-lg transition"
              title="Test Slot Concurrency Lock Guard"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Slot Guard</span>
            </button>

            {/* Reset Session */}
            <button
              onClick={resetSession}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Reset partial session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-medium text-xs shadow-sm shadow-emerald-200 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="font-bold">₹{cart.subtotal.toFixed(2)}</span>
              {cart.itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                  {cart.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
