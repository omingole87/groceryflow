import React, { useState } from 'react';
import { Plus, Check, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useGroceryFlow } from '../context/GroceryFlowContext';

export const GroceryCatalog: React.FC = () => {
  const { products, cart, addToCart, setView, setIsCartDrawerOpen } = useGroceryFlow();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleAdd = async (productId: string) => {
    await addToCart(productId, 1);
    setAddedAnimationId(productId);
    setTimeout(() => setAddedAnimationId(null), 1000);
  };

  const getItemQuantityInCart = (productId: string): number => {
    const item = cart.items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner: Explaining the GroceryFlow Advantage */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/30 border border-emerald-400/40 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Problem Solved: Zero Upfront Friction</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Shop fresh groceries instantly. No 9-screen signups.
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
            Grocery signups die when apps demand everything upfront. With GroceryFlow, your cart starts immediately on step 1. At checkout, we ask <strong>one question per screen</strong>, persist state server-side, and let you order as a guest.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-emerald-200">
            <span className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Cart works from step one</span>
            </span>
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Refresh-proof server persistence</span>
            </span>
            <span className="flex items-center space-x-1">
              <Check className="w-4 h-4 text-teal-300" />
              <span>Atomic slot capacity limits</span>
            </span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((prod) => {
          const qty = getItemQuantityInCart(prod.id);
          const isJustAdded = addedAnimationId === prod.id;

          return (
            <div
              key={prod.id}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition flex flex-col overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-700 shadow-sm">
                  {prod.category}
                </span>

                {qty > 0 && (
                  <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[11px] font-bold shadow">
                    {qty} in cart
                  </span>
                )}
              </div>

              {/* Info & Add Action */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">
                    {prod.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{prod.unit}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-base sm:text-lg font-black text-slate-900">
                      ₹{prod.price.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAdd(prod.id)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                      isJustAdded
                        ? 'bg-emerald-700 text-white scale-95'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-transparent'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Bar when items in Cart */}
      {cart.itemCount > 0 && (
        <div className="fixed bottom-6 inset-x-4 max-w-lg mx-auto z-30">
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-slate-800 backdrop-blur">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setIsCartDrawerOpen(true)}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow">
                {cart.itemCount}
              </div>
              <div>
                <p className="text-xs text-slate-400">Total in Cart</p>
                <p className="text-sm font-extrabold text-white">₹{cart.total.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={() => setView('wizard')}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
