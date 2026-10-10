import React, { useState, useEffect } from 'react';
import {
  X,
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { api } from '../api/client';
import { useGroceryFlow } from '../context/GroceryFlowContext';

export const FunnelAnalyticsModal: React.FC = () => {
  const { isAnalyticsOpen, setIsAnalyticsOpen } = useGroceryFlow();
  const [metrics, setMetrics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await api.getFunnelMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch funnel metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAnalyticsOpen) {
      fetchMetrics();
    }
  }, [isAnalyticsOpen]);

  if (!isAnalyticsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Funnel Completion & Drop-Off Analytics
              </h2>
              <p className="text-xs text-slate-500">
                Measurable outcome: Funnel completion rate across the 3-step wizard
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchMetrics}
              disabled={isLoading}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsAnalyticsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
                <Users className="w-4 h-4" />
                <span>Total Sessions</span>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {metrics?.totalSessions ?? 0}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2 text-emerald-600 text-xs font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Orders Placed</span>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {metrics?.totalOrders ?? 0}
              </p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <div className="flex items-center space-x-2 text-emerald-700 text-xs font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>Funnel Conversion</span>
              </div>
              <p className="text-2xl font-black text-emerald-800 mt-2">
                {metrics?.funnelConversionRate ?? 0}%
              </p>
            </div>
          </div>

          {/* Visual Step-by-Step Funnel */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Conversion & Drop-Off by Step
            </h3>

            <div className="space-y-3">
              {metrics?.steps?.map((step: any, index: number) => {
                const isFinal = index === metrics.steps.length - 1;
                return (
                  <div key={step.step} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">{step.name}</span>
                      <div className="flex items-center space-x-3 text-slate-500">
                        <span>
                          <strong className="text-slate-900">{step.count}</strong> sessions
                        </span>
                        <span className="text-emerald-700 font-bold">
                          {step.conversionFromPrevious}% conv.
                        </span>
                        {step.dropoffRate > 0 && (
                          <span className="text-rose-600 font-medium">
                            -{step.dropoffRate}% dropoff ({step.dropoffCount})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Funnel Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          isFinal ? 'bg-emerald-600' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.max(5, step.overallConversion)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Event Stream Log */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                <span>Live Event Stream (`funnel_events` table)</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Last 25 entries</span>
            </div>

            <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 font-mono text-[11px] max-h-48 overflow-y-auto space-y-1.5">
              {metrics?.recentEvents?.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No events logged yet.</p>
              ) : (
                metrics?.recentEvents?.map((evt: any) => (
                  <div key={evt.id} className="flex items-center justify-between border-b border-slate-900 pb-1">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-emerald-400 font-bold">[{evt.event_type}]</span>
                      <span className="text-slate-400">step: {evt.step}</span>
                      <span className="text-slate-500 truncate">
                        (sess: {evt.session_id.substring(0, 8)}...)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">
                      {new Date(evt.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
