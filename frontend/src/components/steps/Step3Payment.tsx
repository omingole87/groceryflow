import React, { useState } from 'react';
import {
  CreditCard,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Smartphone,
  Coins,
  AlertCircle,
  MapPin,
  Clock,
  QrCode,
  Building2,
  Lock,
} from 'lucide-react';
import { useGroceryFlow } from '../../context/GroceryFlowContext';

export const Step3Payment: React.FC = () => {
  const { session, cart, checkout, setActiveStep } = useGroceryFlow();

  const savedPayment = session?.answers?.payment || {};
  const savedAddress = session?.answers?.address || {};
  const savedSlot = session?.answers?.slot || {};

  const [formData, setFormData] = useState({
    contactName: savedPayment.contactName || session?.guestName || 'Om Vijay Ingole',
    contactEmail: savedPayment.contactEmail || session?.guestEmail || 'om.ingole@ssgmce.ac.in',
    contactPhone: savedPayment.contactPhone || '9823012345',
    paymentMethod: savedPayment.paymentMethod || 'upi',
    upiId: savedPayment.upiId || 'om.ingole@okhdfcbank',
    upiMode: 'vpa' as 'vpa' | 'qr',
    bankName: 'State Bank of India (SBI)',
    cardNumber: '•••• •••• •••• 5892 (RuPay Platinum)',
    cardExp: '08/29',
    cardCvc: '456',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fillSampleProfile = () => {
    setFormData({
      ...formData,
      contactName: 'Om Vijay Ingole',
      contactEmail: 'om.ingole@ssgmce.ac.in',
      contactPhone: '9823012345',
      paymentMethod: 'upi',
      upiId: 'om.ingole@okhdfcbank',
    });
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contactName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.contactEmail.trim() || !formData.contactEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address for your GST tax invoice.');
      return;
    }

    const cleanPhone = formData.contactPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9823012345).');
      return;
    }

    if (formData.paymentMethod === 'upi' && formData.upiMode === 'vpa' && !formData.upiId.includes('@')) {
      setErrorMsg('Please enter a valid UPI ID (e.g. username@okhdfcbank or 9823012345@paytm).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await checkout({
        contactName: formData.contactName.trim(),
        contactEmail: formData.contactEmail.trim(),
        contactPhone: `+91 ${cleanPhone.slice(-10)}`,
        paymentMethod: formData.paymentMethod,
        paymentDetails: {
          upiId: formData.paymentMethod === 'upi' ? formData.upiId : undefined,
          bankName: formData.paymentMethod === 'netbanking' ? formData.bankName : undefined,
        },
      });
    } catch (err: any) {
      if (err.data?.code === 'SLOT_CAPACITY_EXCEEDED' || err.status === 409) {
        setErrorMsg('Selected delivery slot just filled up! Please pick another slot in Step 2.');
        setTimeout(() => setActiveStep('slot'), 2000);
      } else {
        setErrorMsg(err.message || 'Payment failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-2">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Screen 3 of 3 (Guest Checkout & Indian Payment)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Profile & Payment
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Order as a guest with UPI, Cash on Delivery, RuPay cards, or Net Banking.
          </p>
        </div>

        <button
          type="button"
          onClick={fillSampleProfile}
          className="self-start sm:self-auto text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition"
        >
          Quick Fill Info
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Recap of Saved Steps 1 & 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
        <div className="flex items-start space-x-2.5">
          <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <span className="font-bold text-slate-700">Delivering to:</span>
            <p className="text-slate-600 truncate font-medium">
              {savedAddress.flatHouse || savedAddress.street || 'Address saved'}, {savedAddress.areaColony || ''}
            </p>
            <p className="text-slate-500 text-[11px] truncate">
              {savedAddress.city || 'Shegaon'}, {savedAddress.state || 'Maharashtra'} - {savedAddress.pincode || savedAddress.zipCode || '444203'}
            </p>
            <button
              onClick={() => setActiveStep('address')}
              className="text-[11px] text-emerald-600 font-semibold hover:underline mt-0.5 block"
            >
              Edit address
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-2.5">
          <Clock className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <span className="font-bold text-slate-700">Reserved Slot:</span>
            <p className="text-slate-600 truncate font-medium">{savedSlot.label || 'Delivery Slot'}</p>
            <p className="text-slate-500 text-[11px]">
              {savedSlot.startTime} – {savedSlot.endTime} (Capacity Lock Active)
            </p>
            <button
              onClick={() => setActiveStep('slot')}
              className="text-[11px] text-emerald-600 font-semibold hover:underline mt-0.5 block"
            >
              Change slot
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Contact Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Guest Contact Details
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>No mandatory password required</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Om Vijay Ingole"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (For GST Tax Invoice) *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. om.ingole@ssgmce.ac.in"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Indian Mobile Number (For Delivery Partner SMS & Call) *
            </label>
            <div className="relative flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9823012345"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-xs sm:text-sm font-mono tracking-wide focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Indian Payment Methods */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Select Payment Method
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">100% RBI & PCI-DSS Secure</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'upi', label: 'UPI (GPay/PhonePe)', icon: Smartphone, tag: 'Most Popular' },
              { id: 'cod', label: 'Cash on Delivery', icon: Coins, tag: 'Pay at Door' },
              { id: 'rupay', label: 'RuPay / Cards', icon: CreditCard, tag: 'All Indian Banks' },
              { id: 'netbanking', label: 'Net Banking', icon: Building2, tag: 'SBI / HDFC / ICICI' },
            ].map((method) => {
              const Icon = method.icon;
              const isSelected = formData.paymentMethod === method.id;
              return (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{method.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5">{method.tag}</span>
                </button>
              );
            })}
          </div>

          {/* UPI Payment Flow */}
          {formData.paymentMethod === 'upi' && (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <span className="text-xs font-bold text-emerald-950">UPI Payment Options</span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, upiMode: 'vpa' })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      formData.upiMode === 'vpa'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-emerald-100'
                    }`}
                  >
                    UPI ID / VPA
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, upiMode: 'qr' })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      formData.upiMode === 'qr'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-emerald-100'
                    }`}
                  >
                    Scan QR Code
                  </button>
                </div>
              </div>

              {formData.upiMode === 'vpa' ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Enter UPI ID (Virtual Payment Address)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. om.ingole@okhdfcbank or 9823012345@paytm"
                      value={formData.upiId}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-slate-500">
                    <span>Quick Handles:</span>
                    {['@okaxis', '@okhdfcbank', '@paytm', '@ybl', '@ibl'].map((handle) => (
                      <button
                        type="button"
                        key={handle}
                        onClick={() => {
                          const base = formData.upiId.split('@')[0] || 'om.ingole';
                          setFormData({ ...formData, upiId: `${base}${handle}` });
                        }}
                        className="bg-white px-2 py-0.5 rounded border border-slate-200 hover:border-emerald-400 font-mono"
                      >
                        {handle}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 py-2">
                  <div className="w-24 h-24 bg-white p-2 rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                    <QrCode className="w-16 h-16 text-slate-800" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">UPI QR</span>
                  </div>
                  <div className="space-y-1 text-center sm:text-left text-xs">
                    <span className="font-bold text-emerald-900">
                      Scan & Pay ₹{cart.total.toFixed(2)} with any UPI App
                    </span>
                    <p className="text-slate-500 text-[11px]">
                      Open PhonePe, Google Pay, Paytm, or BHIM and scan this code to complete payment instantly.
                    </p>
                    <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-[10px] text-emerald-700 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Listening for UPI authorization...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cash on Delivery (COD) Option */}
          {formData.paymentMethod === 'cod' && (
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-amber-900 font-bold">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>Pay via Cash or UPI at Doorstep</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Pay ₹{cart.total.toFixed(2)} directly to our delivery partner when your grocery arrives at your doorstep in Shegaon / campus. Our rider will carry both cash change and a portable UPI QR scanner!
              </p>
            </div>
          )}

          {/* RuPay / Card Flow */}
          {formData.paymentMethod === 'rupay' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-600">
                  Domestic RuPay / Visa / Mastercard
                </label>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  RuPay 0% Surcharge
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={formData.cardNumber}
                  className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                />
                <div className="absolute right-3 top-2.5 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Expiry</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.cardExp}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">CVV</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.cardCvc}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Net Banking Flow */}
          {formData.paymentMethod === 'netbanking' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-[11px] font-bold text-slate-600">
                Select Indian Bank
              </label>
              <select
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                You will be securely redirected to your bank portal for OTP authorization.
              </p>
            </div>
          )}
        </div>

        {/* Indian Grocery Order Price Summary */}
        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Items Subtotal ({cart.itemCount})</span>
            <span className="font-semibold text-slate-900">₹{cart.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span className="flex items-center space-x-1">
              <span>GST & Taxes</span>
              <span className="text-[10px] text-slate-400 font-normal">(5% on grocery staples)</span>
            </span>
            <span className="font-semibold text-emerald-700">Included</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Delivery Charges</span>
            <span>
              {cart.deliveryFee === 0 ? (
                <strong className="text-emerald-700 font-bold">FREE (Above ₹499)</strong>
              ) : (
                `₹${cart.deliveryFee.toFixed(2)}`
              )}
            </span>
          </div>

          <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-emerald-200">
            <span>Total Payable Amount</span>
            <span className="text-emerald-700 text-base">₹{cart.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveStep('slot')}
            className="flex items-center space-x-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Slots</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting || cart.itemCount === 0}
            className="flex items-center space-x-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-200 transition disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Securing Slot & Placing Order...'
                : formData.paymentMethod === 'cod'
                ? `Place COD Order (₹${cart.total.toFixed(2)})`
                : `Pay ₹${cart.total.toFixed(2)}`}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
