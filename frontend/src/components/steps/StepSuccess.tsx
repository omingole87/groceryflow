import React from 'react';
import { CheckCircle2, MapPin, Clock, BarChart3, ShoppingBag } from 'lucide-react';
import { useGroceryFlow } from '../../context/GroceryFlowContext';

export const StepSuccess: React.FC = () => {
  const { lastOrder, resetSession, setIsAnalyticsOpen, setView } = useGroceryFlow();

  if (!lastOrder) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-500 text-sm">No recent order details available.</p>
        <button
          onClick={() => setView('catalog')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const { orderId, totalAmount, deliveryAddress, slot, contactInfo, items } = lastOrder;

  return (
    <div className="space-y-6 text-center sm:text-left">
      {/* Success Badge Banner */}
      <div className="bg-emerald-600 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 shadow-xl shadow-emerald-100">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-1">
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider bg-emerald-700/60 px-2.5 py-0.5 rounded-full">
            Checkout Completed Successfully
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Your Groceries Are On The Way!</h2>
          <p className="text-xs sm:text-sm text-emerald-100">
            Order ID: <strong className="font-mono text-white">{orderId}</strong> • Confirmation sent to {contactInfo.email}
          </p>
        </div>
      </div>

      {/* Delivery Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-700 font-bold">
            <Clock className="w-4 h-4" />
            <span>Delivery Window</span>
          </div>
          <p className="text-sm font-extrabold text-slate-800">
            {slot?.label || 'Scheduled Slot'}
          </p>
          <p className="text-slate-500 text-[11px]">
            Reserved atomically via PostgreSQL capacity lock.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-700 font-bold">
            <MapPin className="w-4 h-4" />
            <span>Delivery Address</span>
          </div>
          <p className="text-sm font-extrabold text-slate-800">
            {deliveryAddress.flatHouse || deliveryAddress.street}
            {deliveryAddress.areaColony ? `, ${deliveryAddress.areaColony}` : ''}
          </p>
          <p className="text-slate-500 text-[11px]">
            {deliveryAddress.landmark ? `Landmark: ${deliveryAddress.landmark} • ` : ''}
            {deliveryAddress.city}, {deliveryAddress.state || ''} {deliveryAddress.pincode || deliveryAddress.zipCode}
          </p>
        </div>
      </div>

      {/* Ordered Items Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Items Ordered ({items?.length || 0})
          </h3>
          <span className="text-xs font-bold text-slate-900">
            Total Paid: <strong className="text-emerald-700 font-extrabold">₹{totalAmount.toFixed(2)}</strong>
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
          {items?.map((item: any) => (
            <div key={item.productId || item.id} className="py-2 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium">
                {item.quantity}x {item.name || item.product_name}
              </span>
              <span className="font-semibold text-slate-900">
                ₹{(item.quantity * item.price).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={() => setIsAnalyticsOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>View Funnel Analytics</span>
        </button>

        <button
          onClick={resetSession}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Start Another Order</span>
        </button>
      </div>
    </div>
  );
};
