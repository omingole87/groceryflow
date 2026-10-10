/**
 * GroceryFlow State Machine (Localized for Indian Commerce)
 * Canonical wizard steps and progress evaluation.
 * Progress is derived strictly from server-persisted answers.
 */

export type StepKey = 'address' | 'slot' | 'payment';

export interface StepDefinition {
  id: StepKey;
  order: number;
  title: string;
  subtitle: string;
  isAnswered: (payload: any) => boolean;
  validate: (payload: any) => { valid: boolean; errors?: Record<string, string> };
}

export const STEPS: StepDefinition[] = [
  {
    id: 'address',
    order: 1,
    title: 'Delivery Address',
    subtitle: 'Where should we deliver your groceries in India?',
    isAnswered: (payload) => {
      if (!payload || typeof payload !== 'object') return false;
      // Supports both Indian address structure and legacy field aliases
      const streetOrArea = (payload.areaColony || payload.street || payload.area)?.trim();
      const house = (payload.flatHouse || payload.house || payload.street)?.trim();
      const city = payload.city?.trim();
      const pincode = (payload.pincode || payload.zipCode)?.trim();
      return Boolean(streetOrArea && city && pincode);
    },
    validate: (payload) => {
      const errors: Record<string, string> = {};
      const house = (payload?.flatHouse || payload?.house || payload?.street)?.trim();
      const area = (payload?.areaColony || payload?.area || payload?.street)?.trim();
      const city = payload?.city?.trim();
      const pincode = (payload?.pincode || payload?.zipCode)?.trim();

      if (!house) {
        errors.flatHouse = 'Flat / House / Floor / Building name is required';
      }
      if (!area) {
        errors.areaColony = 'Street / Colony / Area / Road name is required';
      }
      if (!city) {
        errors.city = 'City / District is required';
      }
      if (!pincode) {
        errors.pincode = '6-digit Indian PIN Code is required';
      } else if (!/^[1-9][0-9]{5}$/.test(pincode.replace(/\s+/g, ''))) {
        errors.pincode = 'Please enter a valid 6-digit PIN code (e.g. 444203 or 411001)';
      }

      return { valid: Object.keys(errors).length === 0, errors };
    },
  },
  {
    id: 'slot',
    order: 2,
    title: 'Delivery Slot',
    subtitle: 'Choose an available delivery time window',
    isAnswered: (payload) => {
      if (!payload || typeof payload !== 'object') return false;
      return Boolean(payload.slotId?.trim());
    },
    validate: (payload) => {
      const errors: Record<string, string> = {};
      if (!payload?.slotId?.trim()) errors.slotId = 'Please select a delivery slot';
      return { valid: Object.keys(errors).length === 0, errors };
    },
  },
  {
    id: 'payment',
    order: 3,
    title: 'Profile & Payment',
    subtitle: 'Enter your contact info and select a payment method (UPI / COD / Cards)',
    isAnswered: (payload) => {
      if (!payload || typeof payload !== 'object') return false;
      return Boolean(
        payload.contactName?.trim() &&
        payload.contactEmail?.trim() &&
        payload.paymentMethod?.trim()
      );
    },
    validate: (payload) => {
      const errors: Record<string, string> = {};
      if (!payload?.contactName?.trim()) errors.contactName = 'Full name is required';
      if (!payload?.contactEmail?.trim() || !payload.contactEmail.includes('@')) {
        errors.contactEmail = 'A valid email is required for the GST invoice';
      }
      if (payload?.contactPhone?.trim()) {
        const cleanPhone = payload.contactPhone.replace(/[\s\-\+]/g, '');
        // Validate Indian 10-digit mobile number (allows with or without 91 prefix)
        const isIndianPhone = /^(?:91)?[6-9]\d{9}$/.test(cleanPhone);
        if (!isIndianPhone && cleanPhone.length < 10) {
          errors.contactPhone = 'Please enter a valid 10-digit Indian mobile number';
        }
      }
      if (!payload?.paymentMethod?.trim()) {
        errors.paymentMethod = 'Please choose a payment method (UPI / COD / Card)';
      }
      return { valid: Object.keys(errors).length === 0, errors };
    },
  },
];

export interface FlowState {
  currentStep: StepKey | 'confirmation';
  completedSteps: StepKey[];
  progressPercent: number;
  totalSteps: number;
  isAllCompleted: boolean;
  canProceedTo: (targetStep: StepKey) => boolean;
}

export function nextStep(answers: Record<string, any>): FlowState {
  const completedSteps: StepKey[] = [];

  for (const step of STEPS) {
    const answer = answers[step.id];
    if (step.isAnswered(answer)) {
      completedSteps.push(step.id);
    } else {
      return {
        currentStep: step.id,
        completedSteps,
        progressPercent: Math.round((completedSteps.length / STEPS.length) * 100),
        totalSteps: STEPS.length,
        isAllCompleted: false,
        canProceedTo: (targetStep: StepKey) => {
          const targetIndex = STEPS.findIndex((s) => s.id === targetStep);
          return targetIndex <= completedSteps.length;
        },
      };
    }
  }

  return {
    currentStep: 'confirmation',
    completedSteps,
    progressPercent: 100,
    totalSteps: STEPS.length,
    isAllCompleted: true,
    canProceedTo: () => true,
  };
}

export function getStepById(id: string): StepDefinition | undefined {
  return STEPS.find((s) => s.id === id);
}
