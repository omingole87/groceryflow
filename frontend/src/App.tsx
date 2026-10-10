import React from 'react';
import { GroceryFlowProvider, useGroceryFlow } from './context/GroceryFlowContext';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { GroceryCatalog } from './components/GroceryCatalog';
import { StepWizard } from './components/StepWizard';
import { FunnelAnalyticsModal } from './components/FunnelAnalyticsModal';
import { ConcurrencyTesterModal } from './components/ConcurrencyTesterModal';
import { Loader2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { view, isLoading } = useGroceryFlow();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-200">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Connecting to GroceryFlow...</h2>
        <p className="text-xs text-slate-500 mt-1">Resuming server session & checking cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      <main className="flex-1">
        {view === 'catalog' && <GroceryCatalog />}
        {(view === 'wizard' || view === 'confirmation') && <StepWizard />}
      </main>

      {/* Modals & Drawers */}
      <CartDrawer />
      <FunnelAnalyticsModal />
      <ConcurrencyTesterModal />

      {/* Architectural Specs Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-800">GroceryFlow</span>
            <span>•</span>
            <span>State Machine: Server-derived progress (refresh-proof)</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span className="bg-slate-100 px-2.5 py-1 rounded-md font-mono text-slate-700">
              React + TypeScript + Node + PostgreSQL
            </span>
            <span className="text-emerald-700 font-semibold">
              Transactional Capacity Lock: Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <GroceryFlowProvider>
      <MainApp />
    </GroceryFlowProvider>
  );
}
