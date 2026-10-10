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
  currentStep: 'address' | 'slot' | 'payment' | 'confirmation';
  completedSteps: ('address' | 'slot' | 'payment')[];
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

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod_aashirvaad_atta',
    name: 'Aashirvaad Sharbati Select Chakki Atta (5 kg)',
    category: 'Atta, Rice & Dal',
    price: 245.0,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    unit: '5 kg bag',
    stock: 50,
  },
  {
    id: 'prod_amul_milk',
    name: 'Amul Taaza Fresh Homogenised Toned Milk (1 Litre)',
    category: 'Dairy & Bread',
    price: 56.0,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
    unit: '1 Litre pouch',
    stock: 120,
  },
  {
    id: 'prod_malai_paneer',
    name: 'Fresh Dairy Malai Paneer (200g)',
    category: 'Dairy & Bread',
    price: 85.0,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80',
    unit: '200g pack',
    stock: 40,
  },
  {
    id: 'prod_desi_tomatoes',
    name: 'Farm Fresh Desi Tomatoes (1 kg)',
    category: 'Fresh Vegetables',
    price: 38.0,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
    unit: '1 kg bundle',
    stock: 100,
  },
  {
    id: 'prod_onions',
    name: 'Nasik Fresh Red Onions / Kanda (1 kg)',
    category: 'Fresh Vegetables',
    price: 34.0,
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80',
    unit: '1 kg mesh bag',
    stock: 150,
  },
  {
    id: 'prod_potatoes',
    name: 'Fresh Jyoti Potatoes / Aloo (1 kg)',
    category: 'Fresh Vegetables',
    price: 28.0,
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
    unit: '1 kg bundle',
    stock: 140,
  },
  {
    id: 'prod_sunflower_oil',
    name: 'Fortune Sunlite Refined Sunflower Oil (1 Litre)',
    category: 'Edible Oils & Ghee',
    price: 142.0,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    unit: '1 Litre pouch',
    stock: 60,
  },
  {
    id: 'prod_tata_salt',
    name: 'Tata Salt Vacuum Evaporated Iodised (1 kg)',
    category: 'Spices & Seasonings',
    price: 28.0,
    imageUrl: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400&q=80',
    unit: '1 kg pack',
    stock: 200,
  },
  {
    id: 'prod_palak',
    name: 'Fresh Palak / Spinach Bunch (250g)',
    category: 'Fresh Vegetables',
    price: 22.0,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
    unit: '250g bunch',
    stock: 80,
  },
];

const DEFAULT_SLOTS: DeliverySlot[] = [
  {
    id: 'slot_morning',
    date: '2026-10-11',
    startTime: '08:00',
    endTime: '10:00',
    label: 'Morning Slot (8 AM - 10 AM)',
    capacity: 20,
    capacityUsed: 14,
    remainingCapacity: 6,
    isAvailable: true,
    status: 'available',
  },
  {
    id: 'slot_midday',
    date: '2026-10-11',
    startTime: '11:00',
    endTime: '13:00',
    label: 'Midday Slot (11 AM - 1 PM)',
    capacity: 20,
    capacityUsed: 20,
    remainingCapacity: 0,
    isAvailable: false,
    status: 'full',
  },
  {
    id: 'slot_evening',
    date: '2026-10-11',
    startTime: '17:00',
    endTime: '19:00',
    label: 'Evening Prime (5 PM - 7 PM)',
    capacity: 20,
    capacityUsed: 18,
    remainingCapacity: 2,
    isAvailable: true,
    status: 'few_left',
  },
  {
    id: 'slot_night',
    date: '2026-10-11',
    startTime: '20:00',
    endTime: '22:00',
    label: 'Night Delivery (8 PM - 10 PM)',
    capacity: 20,
    capacityUsed: 6,
    remainingCapacity: 14,
    isAvailable: true,
    status: 'available',
  },
];

const STORAGE_KEYS = {
  CART: 'mock_groceryflow_cart_items',
  SLOTS: 'mock_groceryflow_slots',
  ANSWERS: 'mock_groceryflow_answers',
  ORDERS: 'mock_groceryflow_orders',
};

function load<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage quota errors
  }
}

export const mockBackend = {
  getSession(): SessionData {
    const answers = load<Record<string, any>>(STORAGE_KEYS.ANSWERS, {});
    const completedSteps: ('address' | 'slot' | 'payment')[] = [];

    let currentStep: 'address' | 'slot' | 'payment' | 'confirmation' = 'address';
    if (answers.address) completedSteps.push('address');
    if (answers.slot) completedSteps.push('slot');
    if (answers.payment) completedSteps.push('payment');

    if (!answers.address) {
      currentStep = 'address';
    } else if (!answers.slot) {
      currentStep = 'slot';
    } else if (!answers.payment) {
      currentStep = 'payment';
    } else {
      currentStep = 'confirmation';
    }

    const cart = this.getCart();

    return {
      sessionId: 'demo-session-' + (localStorage.getItem('groceryflow_demo_id') || 'preview'),
      isGuest: true,
      guestName: answers.payment?.contactName || null,
      guestEmail: answers.payment?.contactEmail || null,
      answers,
      flowState: {
        currentStep,
        completedSteps,
        progressPercent: Math.round((completedSteps.length / 3) * 100),
        totalSteps: 3,
        isAllCompleted: currentStep === 'confirmation',
      },
      cartSummary: {
        itemCount: cart.itemCount,
        subtotal: cart.subtotal,
      },
    };
  },

  saveAnswer(step: string, payload: any): SessionData {
    const answers = load<Record<string, any>>(STORAGE_KEYS.ANSWERS, {});
    answers[step] = payload;
    save(STORAGE_KEYS.ANSWERS, answers);
    return this.getSession();
  },

  resetSession(): SessionData {
    localStorage.removeItem(STORAGE_KEYS.ANSWERS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    return this.getSession();
  },

  getProducts(): Product[] {
    return DEFAULT_PRODUCTS;
  },

  getCart(): CartSummary {
    const rawItems = load<Array<{ productId: string; quantity: number }>>(STORAGE_KEYS.CART, [
      { productId: 'prod_aashirvaad_atta', quantity: 1 },
      { productId: 'prod_amul_milk', quantity: 2 },
      { productId: 'prod_malai_paneer', quantity: 1 },
    ]);

    let itemCount = 0;
    let subtotal = 0;

    const items: CartItem[] = [];

    rawItems.forEach((it, idx) => {
      const prod = DEFAULT_PRODUCTS.find((p) => p.id === it.productId);
      if (!prod) return;
      const lineTotal = +(it.quantity * prod.price).toFixed(2);
      itemCount += it.quantity;
      subtotal += lineTotal;

      items.push({
        id: idx + 1,
        productId: prod.id,
        name: prod.name,
        category: prod.category,
        price: prod.price,
        imageUrl: prod.imageUrl,
        unit: prod.unit,
        quantity: it.quantity,
        lineTotal,
      });
    });

    const deliveryFee = subtotal >= 499.0 || subtotal === 0 ? 0.0 : 49.0;
    const remaining = Math.max(0, 499.0 - subtotal);
    const total = +(subtotal + deliveryFee).toFixed(2);

    return {
      items,
      itemCount,
      subtotal: +subtotal.toFixed(2),
      deliveryFee,
      freeDeliveryThreshold: 499.0,
      freeDeliveryRemaining: +remaining.toFixed(2),
      total,
    };
  },

  addToCart(productId: string, quantity = 1): CartSummary {
    const raw = load<Array<{ productId: string; quantity: number }>>(STORAGE_KEYS.CART, [
      { productId: 'prod_aashirvaad_atta', quantity: 1 },
      { productId: 'prod_amul_milk', quantity: 2 },
      { productId: 'prod_malai_paneer', quantity: 1 },
    ]);
    const existing = raw.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      raw.push({ productId, quantity });
    }
    save(STORAGE_KEYS.CART, raw);
    return this.getCart();
  },

  updateCartItem(productId: string, quantity: number): CartSummary {
    let raw = load<Array<{ productId: string; quantity: number }>>(STORAGE_KEYS.CART, [
      { productId: 'prod_aashirvaad_atta', quantity: 1 },
      { productId: 'prod_amul_milk', quantity: 2 },
      { productId: 'prod_malai_paneer', quantity: 1 },
    ]);
    if (quantity <= 0) {
      raw = raw.filter((i) => i.productId !== productId);
    } else {
      const existing = raw.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity = quantity;
      } else {
        raw.push({ productId, quantity });
      }
    }
    save(STORAGE_KEYS.CART, raw);
    return this.getCart();
  },

  removeFromCart(productId: string): CartSummary {
    return this.updateCartItem(productId, 0);
  },

  getSlots(): DeliverySlot[] {
    return load<DeliverySlot[]>(STORAGE_KEYS.SLOTS, DEFAULT_SLOTS);
  },

  resetSlot(slotId: string, capacityUsed = 0): DeliverySlot[] {
    const slots = this.getSlots();
    const target = slots.find((s) => s.id === slotId);
    if (target) {
      target.capacityUsed = capacityUsed;
      target.remainingCapacity = Math.max(0, target.capacity - capacityUsed);
      target.isAvailable = target.remainingCapacity > 0;
      target.status = target.remainingCapacity === 0 ? 'full' : target.remainingCapacity <= 3 ? 'few_left' : 'available';
      save(STORAGE_KEYS.SLOTS, slots);
    }
    return slots;
  },

  testSlotReservation(slotId: string): DeliverySlot {
    const slots = this.getSlots();
    const target = slots.find((s) => s.id === slotId);
    if (!target) throw new Error('Slot not found');

    if (target.capacityUsed >= target.capacity) {
      const err: any = new Error('Slot capacity reached maximum threshold');
      err.status = 409;
      err.data = { code: 'SLOT_CAPACITY_EXCEEDED' };
      throw err;
    }

    target.capacityUsed += 1;
    target.remainingCapacity = Math.max(0, target.capacity - target.capacityUsed);
    target.isAvailable = target.remainingCapacity > 0;
    target.status = target.remainingCapacity === 0 ? 'full' : target.remainingCapacity <= 3 ? 'few_left' : 'available';
    save(STORAGE_KEYS.SLOTS, slots);
    return target;
  },

  checkout(payload: any): any {
    const cart = this.getCart();
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const order = {
      orderId,
      status: 'confirmed',
      totalAmount: cart.total,
      deliveryFee: cart.deliveryFee,
      items: cart.items,
      createdAt: new Date().toISOString(),
      contact: payload,
    };
    const orders = load<any[]>(STORAGE_KEYS.ORDERS, []);
    orders.push(order);
    save(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  getOrder(orderId: string): any {
    const orders = load<any[]>(STORAGE_KEYS.ORDERS, []);
    return orders.find((o) => o.orderId === orderId) || orders[orders.length - 1] || null;
  },

  getFunnelMetrics(): any {
    return {
      totalSessions: 1420,
      steps: [
        { step: 'cart', visitors: 1420, dropoffRate: '0%' },
        { step: 'address', visitors: 1180, dropoffRate: '16.9%' },
        { step: 'slot', visitors: 980, dropoffRate: '16.9%' },
        { step: 'payment', visitors: 890, dropoffRate: '9.2%' },
        { step: 'confirmation', visitors: 840, dropoffRate: '5.6%' },
      ],
      conversionRate: '59.1%',
      concurrencyGuardedRejections: 42,
    };
  },

  trackEvent(_step: string, _eventType: string, _metadata?: any): any {
    return { success: true, message: 'Event recorded' };
  },
};
