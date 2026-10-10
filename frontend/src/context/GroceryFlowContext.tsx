import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getStoredSessionId, setStoredSessionId, clearStoredSessionId } from '../api/client';

export type StepKey = 'address' | 'slot' | 'payment';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  unit: string;
  stock: number;
}

export interface CartItem {
  id: number;
  productId: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  unit: string;
  quantity: number;
  lineTotal: number;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  freeDeliveryRemaining: number;
  total: number;
}

export interface DeliverySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  label: string;
  capacity: number;
  capacityUsed: number;
  remainingCapacity: number;
  isAvailable: boolean;
  status: 'available' | 'few_left' | 'full';
}

export interface FlowState {
  currentStep: StepKey | 'confirmation';
  completedSteps: StepKey[];
  progressPercent: number;
  totalSteps: number;
  isAllCompleted: boolean;
}

export interface SessionData {
  sessionId: string;
  isGuest: boolean;
  guestName: string | null;
  guestEmail: string | null;
  answers: Record<string, any>;
  flowState: FlowState;
  cartSummary: {
    itemCount: number;
    subtotal: number;
  };
}

interface GroceryFlowContextType {
  // Session & Flow
  session: SessionData | null;
  isLoading: boolean;
  activeStep: StepKey | 'confirmation';
  setActiveStep: (step: StepKey | 'confirmation') => void;
  saveStepAnswer: (step: StepKey, payload: any) => Promise<boolean>;
  resetSession: () => Promise<void>;
  resumeSessionById: (sessionId: string) => Promise<void>;

  // Catalog & Cart
  products: Product[];
  cart: CartSummary;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItemQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;

  // Delivery Slots
  slots: DeliverySlot[];
  refreshSlots: () => Promise<void>;

  // UI state
  view: 'catalog' | 'wizard' | 'confirmation';
  setView: (view: 'catalog' | 'wizard' | 'confirmation') => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  isAnalyticsOpen: boolean;
  setIsAnalyticsOpen: (open: boolean) => void;
  isConcurrencyModalOpen: boolean;
  setIsConcurrencyModalOpen: (open: boolean) => void;
  lastOrder: any | null;
  setLastOrder: (order: any | null) => void;
  checkout: (paymentData: any) => Promise<any>;
}

const GroceryFlowContext = createContext<GroceryFlowContextType | undefined>(undefined);

const defaultCart: CartSummary = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  deliveryFee: 49.0,
  freeDeliveryThreshold: 499.0,
  freeDeliveryRemaining: 499.0,
  total: 49.0,
};

export const GroceryFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<StepKey | 'confirmation'>('address');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartSummary>(defaultCart);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [view, setView] = useState<'catalog' | 'wizard' | 'confirmation'>('catalog');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isConcurrencyModalOpen, setIsConcurrencyModalOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<any | null>(null);

  // Initialize or resume session from server
  const initSession = useCallback(async (customSessionId?: string) => {
    setIsLoading(true);
    try {
      const storedId = customSessionId || getStoredSessionId() || undefined;
      const sessionData = await api.getSession(storedId);
      setSession(sessionData);

      // Server determines progress!
      const currentServerStep = sessionData.flowState.currentStep;
      setActiveStep(currentServerStep === 'confirmation' ? 'confirmation' : currentServerStep);

      // If user is already on a step in progress, show wizard
      if (sessionData.flowState.completedSteps.length > 0 && currentServerStep !== 'confirmation') {
        // Keep in wizard or allow user choice
      }

      // Fetch cart and products
      const [prodsData, cartData, slotsData] = await Promise.all([
        api.getProducts(),
        api.getCart(),
        api.getSlots(),
      ]);

      setProducts(prodsData);
      setCart(cartData);
      setSlots(slotsData);
    } catch (err) {
      console.error('Failed to initialize session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const refreshSlots = async () => {
    try {
      const data = await api.getSlots();
      setSlots(data);
    } catch (err) {
      console.error('Failed to refresh slots:', err);
    }
  };

  const saveStepAnswer = async (step: StepKey, payload: any): Promise<boolean> => {
    try {
      const updatedSession = await api.saveStepAnswer(step, payload);
      setSession(updatedSession);

      // Progress is derived directly from the server!
      const nextActiveStep = updatedSession.flowState.currentStep;
      setActiveStep(nextActiveStep);

      // Refresh slots in case a slot was selected
      if (step === 'slot') {
        await refreshSlots();
      }

      return true;
    } catch (err) {
      console.error('Failed to save step answer:', err);
      throw err;
    }
  };

  const resetSession = async () => {
    try {
      setIsLoading(true);
      clearStoredSessionId();
      await api.resetSession();
      await initSession();
      setView('catalog');
      setLastOrder(null);
    } catch (err) {
      console.error('Failed to reset session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resumeSessionById = async (targetSessionId: string) => {
    setStoredSessionId(targetSessionId.trim());
    await initSession(targetSessionId.trim());
    setView('wizard');
  };

  const addToCart = async (productId: string, quantity = 1) => {
    try {
      const updatedCart = await api.addToCart(productId, quantity);
      setCart(updatedCart);
      if (session) {
        setSession({
          ...session,
          cartSummary: {
            itemCount: updatedCart.itemCount,
            subtotal: updatedCart.subtotal,
          },
        });
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const updateCartItemQuantity = async (productId: string, quantity: number) => {
    try {
      const updatedCart = await api.updateCartItem(productId, quantity);
      setCart(updatedCart);
      if (session) {
        setSession({
          ...session,
          cartSummary: {
            itemCount: updatedCart.itemCount,
            subtotal: updatedCart.subtotal,
          },
        });
      }
    } catch (err) {
      console.error('Failed to update cart item:', err);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const updatedCart = await api.removeFromCart(productId);
      setCart(updatedCart);
      if (session) {
        setSession({
          ...session,
          cartSummary: {
            itemCount: updatedCart.itemCount,
            subtotal: updatedCart.subtotal,
          },
        });
      }
    } catch (err) {
      console.error('Failed to remove from cart:', err);
    }
  };

  const checkout = async (paymentData: any) => {
    try {
      const order = await api.checkout(paymentData);
      setLastOrder(order);
      setCart(defaultCart);
      setView('confirmation');
      setActiveStep('confirmation');
      await refreshSlots();
      return order;
    } catch (err) {
      console.error('Checkout failed:', err);
      throw err;
    }
  };

  return (
    <GroceryFlowContext.Provider
      value={{
        session,
        isLoading,
        activeStep,
        setActiveStep,
        saveStepAnswer,
        resetSession,
        resumeSessionById,
        products,
        cart,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        slots,
        refreshSlots,
        view,
        setView,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isAnalyticsOpen,
        setIsAnalyticsOpen,
        isConcurrencyModalOpen,
        setIsConcurrencyModalOpen,
        lastOrder,
        setLastOrder,
        checkout,
      }}
    >
      {children}
    </GroceryFlowContext.Provider>
  );
};

export const useGroceryFlow = () => {
  const context = useContext(GroceryFlowContext);
  if (!context) {
    throw new Error('useGroceryFlow must be used within a GroceryFlowProvider');
  }
  return context;
};
