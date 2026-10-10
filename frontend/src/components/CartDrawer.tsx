import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useGroceryFlow } from '../context/GroceryFlowContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    updateCartItemQuantity,
    removeFromCart,
    setView,
  } = useGroceryFlow();

  if (!isCartDrawerOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    setView('wizard');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Your Fresh Cart ({cart.itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center space-x-1.5 font-medium text-emerald-900">
                <Truck className="w-4 h-4 text-emerald-600" />
                {cart.subtotal >= cart.freeDeliveryThreshold ? (
                  <span className="font-bold text-emerald-700">You unlocked FREE Delivery! 🎉</span>
                ) : (
                  <span>
                    Add <strong className="text-emerald-700">₹{cart.freeDeliveryRemaining.toFixed(2)}</strong> more for FREE delivery!
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-emerald-200/70 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (cart.subtotal / cart.freeDeliveryThreshold) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Your cart is empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Add fresh groceries from step one without upfront registration roadblocks.
                </p>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="mt-5 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition"
                >
                  Explore Groceries
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover bg-white flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-[11px] text-slate-400">{item.unit}</p>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                      ₹{item.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg p-1">
                    <button
                      onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                      className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                      className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.items.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>
                    {cart.deliveryFee === 0 ? (
                      <strong className="text-emerald-600 font-bold">FREE</strong>
                    ) : (
                      `₹${cart.deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-emerald-700">₹{cart.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-200 transition"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400">
                1 question per screen • Guest checkout ready
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
