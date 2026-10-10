import React, { useState } from 'react';
import {
  MapPin,
  ArrowRight,
  Building,
  Home,
  FileText,
  Navigation,
  Compass,
  CheckCircle2,
  Map as MapIcon,
  ShieldCheck,
} from 'lucide-react';
import { useGroceryFlow } from '../../context/GroceryFlowContext';

const INDIAN_STATES = [
  'Maharashtra',
  'Karnataka',
  'Delhi NCR',
  'Gujarat',
  'Madhya Pradesh',
  'Telangana',
  'Tamil Nadu',
  'Uttar Pradesh',
  'West Bengal',
  'Rajasthan',
  'Kerala',
  'Andhra Pradesh',
  'Punjab',
  'Haryana',
  'Goa',
  'Bihar',
  'Odisha',
  'Assam',
  'Jharkhand',
  'Chhattisgarh',
  'Uttarakhand',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Chandigarh',
  'Puducherry',
];

export const Step1Address: React.FC = () => {
  const { session, saveStepAnswer } = useGroceryFlow();
  const existingAnswer = session?.answers?.address || {};

  const [formData, setFormData] = useState({
    flatHouse: existingAnswer.flatHouse || existingAnswer.street || '',
    areaColony: existingAnswer.areaColony || existingAnswer.apartment || '',
    landmark: existingAnswer.landmark || '',
    city: existingAnswer.city || 'Shegaon',
    state: existingAnswer.state || 'Maharashtra',
    pincode: existingAnswer.pincode || existingAnswer.zipCode || '444203',
    addressType: existingAnswer.addressType || 'Hostel / Campus',
    instructions: existingAnswer.instructions || '',
    latitude: existingAnswer.latitude || 20.7937,
    longitude: existingAnswer.longitude || 76.6944,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick preset Indian locations
  const fillPresetAddress = (preset: 'ssgmce' | 'pune' | 'mumbai') => {
    if (preset === 'ssgmce') {
      setFormData({
        flatHouse: 'Hostel Block B, Room 204',
        areaColony: 'SSGMCE Campus, Khamgaon Road',
        landmark: 'Opposite Shri Sant Gajanan Maharaj Temple Area',
        city: 'Shegaon',
        state: 'Maharashtra',
        pincode: '444203',
        addressType: 'Hostel / Campus',
        instructions: 'Please call when arriving at Campus Main Gate #1.',
        latitude: 20.7937,
        longitude: 76.6944,
      });
      setLocationSuccessMsg('Applied SSGMCE Shegaon College Campus address!');
    } else if (preset === 'pune') {
      setFormData({
        flatHouse: 'Flat 502, Orchid Heights',
        areaColony: 'Viman Nagar, IT Park Road',
        landmark: 'Near Symbiosis International School',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411014',
        addressType: 'Home',
        instructions: 'Leave with security desk if not available.',
        latitude: 18.5679,
        longitude: 73.9143,
      });
      setLocationSuccessMsg('Applied Pune Metro IT Hub address!');
    } else {
      setFormData({
        flatHouse: 'Flat 12B, Sea Breeze Apartments',
        areaColony: 'Lokhandwala Complex, Andheri West',
        landmark: 'Behind Infinity Mall',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
        addressType: 'Home',
        instructions: 'Ring doorbell twice. Baby sleeping.',
        latitude: 19.1363,
        longitude: 72.8277,
      });
      setLocationSuccessMsg('Applied Mumbai Suburban address!');
    }
    setErrorMsg(null);
    setTimeout(() => setLocationSuccessMsg(null), 3500);
  };

  // Browser Geolocation API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(latitude.toFixed(4)),
          longitude: parseFloat(longitude.toFixed(4)),
        }));
        setIsDetectingLocation(false);
        setLocationSuccessMsg(
          `Accurate GPS Pin pinned at ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E!`
        );
        setTimeout(() => setLocationSuccessMsg(null), 4000);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Fallback to Shegaon coordinates
        setFormData((prev) => ({
          ...prev,
          latitude: 20.7937,
          longitude: 76.6944,
        }));
        setIsDetectingLocation(false);
        setLocationSuccessMsg('Defaulted GPS pin to Shegaon, Buldhana (20.7937° N, 76.6944° E).');
        setTimeout(() => setLocationSuccessMsg(null), 4000);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.flatHouse.trim()) {
      setErrorMsg('Please enter your Flat, House, or Room number.');
      return;
    }
    if (!formData.areaColony.trim()) {
      setErrorMsg('Please enter your Area, Colony, or Street name.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('Please enter your City or District name.');
      return;
    }

    const cleanPin = formData.pincode.replace(/\s+/g, '');
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN Code (e.g. 444203 or 411014).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Send both Indian format fields and backward-compatible aliases
      const payload = {
        flatHouse: formData.flatHouse.trim(),
        areaColony: formData.areaColony.trim(),
        landmark: formData.landmark.trim(),
        city: formData.city.trim(),
        state: formData.state,
        pincode: cleanPin,
        addressType: formData.addressType,
        instructions: formData.instructions.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        // Compatibility aliases for legacy state machine consumers:
        street: `${formData.flatHouse.trim()}, ${formData.areaColony.trim()}`,
        apartment: formData.landmark.trim() ? `Near ${formData.landmark.trim()}` : formData.flatHouse.trim(),
        zipCode: cleanPin,
      };

      await saveStepAnswer('address', payload);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save address to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Screen 1 of 3 (Indian Delivery Address)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Where Should We Deliver In India?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Structured for Indian postal standards with GPS map pinning & landmarks.
          </p>
        </div>

        {/* Quick presets for rapid testing */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Presets:</span>
          <button
            type="button"
            onClick={() => fillPresetAddress('ssgmce')}
            className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition"
            title="SSGMCE College Campus, Shegaon (Buldhana)"
          >
            🎓 SSGMCE Shegaon
          </button>
          <button
            type="button"
            onClick={() => fillPresetAddress('pune')}
            className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-lg transition"
          >
            🏢 Pune
          </button>
          <button
            type="button"
            onClick={() => fillPresetAddress('mumbai')}
            className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-lg transition"
          >
            🏙️ Mumbai
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-rose-600 flex-shrink-0 animate-ping" />
          <span>{errorMsg}</span>
        </div>
      )}

      {locationSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{locationSuccessMsg}</span>
        </div>
      )}

      {/* Interactive Indian Map Pinning Visualizer */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-inner border border-emerald-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-400">
                Indian Geolocation Map Pin
              </span>
            </div>
            <div className="text-sm sm:text-base font-extrabold flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>
                {formData.city || 'Shegaon'}, {formData.state} ({formData.pincode})
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono">
              GPS Coordinates: {formData.latitude}° N, {formData.longitude}° E • Instant delivery eligible
            </p>
          </div>

          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetectingLocation}
            className="flex items-center justify-center space-x-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-60"
          >
            <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-bounce' : ''}`} />
            <span>{isDetectingLocation ? 'Locating on Map...' : 'Detect GPS Location'}</span>
          </button>
        </div>

        {/* Visual Map Radar Grid Simulation */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Delivery Hub: Shegaon / Buldhana Central Depot</span>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Geo-verified Pincode</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Address Type Tag Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Save Address As
          </label>
          <div className="flex flex-wrap gap-2">
            {['Hostel / Campus', 'Home', 'Work / Office', 'Other'].map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => setFormData({ ...formData, addressType: tag })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  formData.addressType === tag
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/30'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Row 1: Flat/House & Area/Colony */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Flat / House / Floor / Building Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Home className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Hostel Block B, Room 204 or Flat 402"
                value={formData.flatHouse}
                onChange={(e) => setFormData({ ...formData, flatHouse: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Colony / Street / Area / Sector *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. SSGMCE Campus, Khamgaon Road or Viman Nagar"
                value={formData.areaColony}
                onChange={(e) => setFormData({ ...formData, areaColony: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Landmark (Crucial for Indian Delivery) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nearby Landmark <span className="text-slate-400 font-normal">(Help delivery partner find you)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <MapIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. Opp. Gajanan Maharaj Temple, Near Gate 2, Behind SBI ATM"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Row 3: City, State, 6-Digit PIN Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">City / District *</label>
            <input
              type="text"
              required
              placeholder="e.g. Shegaon"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition font-medium"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              6-Digit PIN Code *
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="e.g. 444203"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Row 4: Delivery Instructions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Delivery Instructions <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              rows={2}
              placeholder="e.g. Call upon reaching gate, handover to hostel warden, or leave at security desk"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Action button */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          <div className="text-slate-400 text-xs flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Address saved server-side the moment you advance</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-200 transition disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Saving Address...' : 'Next: Choose Delivery Slot'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
