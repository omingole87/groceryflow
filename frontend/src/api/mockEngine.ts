export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  unit: string;
  stock: number;
}

export interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  label: string;
  capacity: number;
  capacity_used: number;
  is_active: boolean;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod_aashirvaad_atta',
    name: 'Aashirvaad Sharbati Select Chakki Atta (5 kg)',
    category: 'Atta, Rice & Dal',
    price: 245.0,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    unit: '5 kg bag',
    stock: 50,
  },
  {
    id: 'prod_amul_milk',
    name: 'Amul Taaza Fresh Homogenised Toned Milk (1 Litre)',
    category: 'Dairy & Bread',
    price: 56.0,
    image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
    unit: '1 Litre pouch',
    stock: 120,
  },
  {
    id: 'prod_malai_paneer',
    name: 'Fresh Dairy Malai Paneer (200g)',
    category: 'Dairy & Bread',
    price: 85.0,
    image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80',
    unit: '200g pack',
    stock: 40,
  },
  {
    id: 'prod_desi_tomatoes',
    name: 'Farm Fresh Desi Tomatoes (1 kg)',
    category: 'Fresh Vegetables',
    price: 38.0,
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
    unit: '1 kg bundle',
    stock: 100,
  },
  {
    id: 'prod_onions',
    name: 'Nasik Fresh Red Onions / Kanda (1 kg)',
    category: 'Fresh Vegetables',
    price: 34.0,
    image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80',
    unit: '1 kg mesh bag',
    stock: 150,
  },
  {
    id: 'prod_potatoes',
    name: 'Fresh Jyoti Potatoes / Aloo (1 kg)',
    category: 'Fresh Vegetables',
    price: 28.0,
    image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
    unit: '1 kg bundle',
    stock: 140,
  },
  {
    id: 'prod_sunflower_oil',
    name: 'Fortune Sunlite Refined Sunflower Oil (1 Litre)',
    category: 'Edible Oils & Ghee',
    price: 142.0,
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    unit: '1 Litre pouch',
    stock: 60,
  },
  {
    id: 'prod_tata_salt',
    name: 'Tata Salt Vacuum Evaporated Iodised (1 kg)',
    category: 'Spices & Seasonings',
    price: 28.0,
    image_url: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400&q=80',
    unit: '1 kg pack',
    stock: 200,
  },
  {
    id: 'prod_palak',
    name: 'Fresh Palak / Spinach Bunch (250g)',
    category: 'Fresh Vegetables',
    price: 22.0,
    image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
    unit: '250g bunch',
    stock: 80,
  },
];

const DEFAULT_SLOTS: Slot[] = [
  {
    id: 'slot_morning',
    date: '2026-10-11',
    start_time: '08:00',
    end_time: '10:00',
    label: 'Morning Slot (8 AM - 10 AM)',
    capacity: 20,
    capacity_used: 14,
    is_active: true,
  },
  {
    id: 'slot_midday',
    date: '2026-10-11',
    start_time: '11:00',
    end_time: '13:00',
    label: 'Midday Slot (11 AM - 1 PM)',
    capacity: 20,
    capacity_used: 20,
    is_active: true,
  },
  {
    id: 'slot_evening',
    date: '2026-10-11',
    start_time: '17:00',
    end_time: '19:00',
    label: 'Evening Prime (5 PM - 7 PM)',
    capacity: 20,
    capacity_used: 17,
    is_active: true,
  },
  {
    id: 'slot_night',
    date: '2026-10-11',
    start_time: '20:00',
    end_time: '22:00',
    label: 'Night Delivery (8 PM - 10 PM)',
    capacity: 20,
    capacity_used: 6,
    is_active: true,
  },
];

const STORAGE_KEYS = {
  CART: 'mock_groceryflow_cart_items',
  SLOTS: 'mock_groceryflow_slots',
  ANSWERS: 'mock_groceryflow_answers',
  ORDERS: 'mock_groceryflow_orders',
  EVENTS: 'mock_groceryflow_events',
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
    // Ignore storage errors
  }
}

export const mockBackend = {
  getSession() {
    const answers = load<Record<string, any>>(STORAGE_KEYS.ANSWERS, {});
    let currentStep = 'address';
    if (answers.address && !answers.slot) {
      currentStep = 'slot';
    } else if (answers.address && answers.slot && !answers.payment) {
      currentStep = 'payment';
    } else if (answers.address && answers.slot && answers.payment) {
      currentStep = 'confirmation';
    }

    return {
      sessionId: 'demo-session-' + (localStorage.getItem('groceryflow_demo_id') || Math.random().toString(36).substring(7)),
      currentStep,
      isGuest: true,
      answers,
    };
  },

  saveAnswer(step: string, payload: any) {
    const answers = load<Record<string, any>>(STORAGE_KEYS.ANSWERS, {});
    answers[step] = payload;
    save(STORAGE_KEYS.ANSWERS, answers);
    return this.getSession();
  },

  resetSession() {
    localStorage.removeItem(STORAGE_KEYS.ANSWERS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    return this.getSession();
  },

  getProducts() {
    return DEFAULT_PRODUCTS;
  },

  getCart() {
    const items = load<Array<{ productId: string; quantity: number }>>(STORAGE_KEYS.CART, [
      { productId: 'prod_aashirvaad_atta', quantity: 1 },
      { productId: 'prod_amul_milk', quantity: 2 },
    ]);

    const enriched = items
      .map((it) => {
        const product = DEFAULT_PRODUCTS.find((p) => p.id === it.productId);
        if (!product) return null;
        return {
          id: 'cart_' + it.productId,
          product_id: it.productId,
          quantity: it.quantity,
          unit_price: product.price,
          product,
        };
      })
      .filter(Boolean);

    const subtotal = enriched.reduce((sum, item: any) => sum + item.unit_price * item.quantity, 0);
    const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;

    return {
      items: enriched,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
    };
  },

  addToCart(productId: string, quantity = 1) {
    const items = load<Array<{ productId: string; quantity: number }>>(STORAGE_KEYS.CART, []);
    const existing = items.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ productId, quantity });
    }
    save(STORAGE_KEYS.CART, items);
    return this.getCart();
  },

  updateCartItem(productId: string, quantity: number) {
    let items = load<Array<{ productId: string; quantity: number }>>(STORAGE_KEYS.CART, []);
    if (quantity <= 0) {
      items = items.filter((i) => i.productId !== productId);
    } else {
      const existing = items.find((i) => i.productId === productId);
      if (existing) existing.quantity = quantity;
    }
    save(STORAGE_KEYS.CART, items);
    return this.getCart();
  },

  removeFromCart(productId: string) {
    return this.updateCartItem(productId, 0);
  },

  getSlots() {
    return load<Slot[]>(STORAGE_KEYS.SLOTS, DEFAULT_SLOTS);
  },

  resetSlot(slotId: string, capacityUsed = 0) {
    const slots = this.getSlots();
    const target = slots.find((s) => s.id === slotId);
    if (target) {
      target.capacity_used = capacityUsed;
      save(STORAGE_KEYS.SLOTS, slots);
    }
    return slots;
  },

  testSlotReservation(slotId: string) {
    const slots = this.getSlots();
    const target = slots.find((s) => s.id === slotId);
    if (!target) throw new Error('Slot not found');

    if (target.capacity_used >= target.capacity) {
      const err: any = new Error('Slot capacity reached maximum threshold');
      err.status = 409;
      err.data = { code: 'SLOT_CAPACITY_EXCEEDED' };
      throw err;
    }

    target.capacity_used += 1;
    save(STORAGE_KEYS.SLOTS, slots);
    return target;
  },

  checkout(payload: any) {
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

  getOrder(orderId: string) {
    const orders = load<any[]>(STORAGE_KEYS.ORDERS, []);
    return orders.find((o) => o.orderId === orderId) || orders[orders.length - 1] || null;
  },

  getFunnelMetrics() {
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

  trackEvent(_step: string, _eventType: string, _metadata?: any) {
    return { success: true, message: 'Event recorded' };
  },
};
