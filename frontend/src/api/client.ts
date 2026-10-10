import { mockBackend } from './mockEngine';

const SESSION_STORAGE_KEY = 'groceryflow_session_id';

export function getStoredSessionId(): string | null {
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

export function setStoredSessionId(id: string): void {
  localStorage.setItem(SESSION_STORAGE_KEY, id);
}

export function clearStoredSessionId(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const sessionId = getStoredSessionId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error: any = new Error(data.error || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Session & Wizard State
  async getSession(sessionId?: string) {
    try {
      const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
      const res = await request<{ success: boolean; data: any }>(`/api/session${query}`);
      if (res.data?.sessionId) {
        setStoredSessionId(res.data.sessionId);
      }
      return res.data;
    } catch {
      return mockBackend.getSession();
    }
  },

  async saveStepAnswer(step: string, payload: any) {
    try {
      const res = await request<{ success: boolean; data: any }>('/api/session/answers', {
        method: 'POST',
        body: JSON.stringify({ step, payload }),
      });
      return res.data;
    } catch {
      return mockBackend.saveAnswer(step, payload);
    }
  },

  async resetSession() {
    try {
      const res = await request<{ success: boolean; data: any }>('/api/session/reset', {
        method: 'POST',
      });
      return res.data;
    } catch {
      return mockBackend.resetSession();
    }
  },

  // Grocery Catalog & Cart
  async getProducts() {
    try {
      const res = await request<{ success: boolean; data: any[] }>('/api/cart/products');
      return res.data;
    } catch {
      return mockBackend.getProducts();
    }
  },

  async getCart() {
    try {
      const res = await request<{ success: boolean; data: any }>('/api/cart');
      return res.data;
    } catch {
      return mockBackend.getCart();
    }
  },

  async addToCart(productId: string, quantity = 1) {
    try {
      const res = await request<{ success: boolean; data: any }>('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      return res.data;
    } catch {
      return mockBackend.addToCart(productId, quantity);
    }
  },

  async updateCartItem(productId: string, quantity: number) {
    try {
      const res = await request<{ success: boolean; data: any }>(`/api/cart/items/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      });
      return res.data;
    } catch {
      return mockBackend.updateCartItem(productId, quantity);
    }
  },

  async removeFromCart(productId: string) {
    try {
      const res = await request<{ success: boolean; data: any }>(`/api/cart/items/${productId}`, {
        method: 'DELETE',
      });
      return res.data;
    } catch {
      return mockBackend.removeFromCart(productId);
    }
  },

  // Delivery Slots
  async getSlots() {
    try {
      const res = await request<{ success: boolean; data: any[] }>('/api/slots');
      return res.data;
    } catch {
      return mockBackend.getSlots();
    }
  },

  async resetSlot(slotId: string, capacityUsed = 0) {
    try {
      const res = await request<{ success: boolean; data: any[] }>(`/api/slots/${slotId}/reset`, {
        method: 'POST',
        body: JSON.stringify({ capacityUsed }),
      });
      return res.data;
    } catch {
      return mockBackend.resetSlot(slotId, capacityUsed);
    }
  },

  async testSlotReservation(slotId: string) {
    try {
      const res = await request<{ success: boolean; data: any }>('/api/slots/reserve-test', {
        method: 'POST',
        body: JSON.stringify({ slotId }),
      });
      return res.data;
    } catch (err: any) {
      if (err?.status === 409) throw err;
      return mockBackend.testSlotReservation(slotId);
    }
  },

  // Orders
  async checkout(payload: {
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    paymentMethod: string;
  }) {
    try {
      const res = await request<{ success: boolean; data: any }>('/api/order/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    } catch {
      return mockBackend.checkout(payload);
    }
  },

  async getOrder(orderId: string) {
    try {
      const res = await request<{ success: boolean; data: any }>(`/api/order/${orderId}`);
      return res.data;
    } catch {
      return mockBackend.getOrder(orderId);
    }
  },

  // Analytics
  async getFunnelMetrics() {
    try {
      const res = await request<{ success: boolean; data: any }>('/api/analytics/funnel');
      return res.data;
    } catch {
      return mockBackend.getFunnelMetrics();
    }
  },

  async trackEvent(step: string, eventType: string, metadata?: any) {
    try {
      const res = await request<{ success: boolean; message: string }>('/api/analytics/event', {
        method: 'POST',
        body: JSON.stringify({ step, eventType, metadata }),
      });
      return res;
    } catch {
      return mockBackend.trackEvent(step, eventType, metadata);
    }
  },
};
