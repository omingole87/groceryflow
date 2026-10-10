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
    const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
    const res = await request<{ success: boolean; data: any }>(`/api/session${query}`);
    if (res.data?.sessionId) {
      setStoredSessionId(res.data.sessionId);
    }
    return res.data;
  },

  async saveStepAnswer(step: string, payload: any) {
    const res = await request<{ success: boolean; data: any }>('/api/session/answers', {
      method: 'POST',
      body: JSON.stringify({ step, payload }),
    });
    return res.data;
  },

  async resetSession() {
    const res = await request<{ success: boolean; data: any }>('/api/session/reset', {
      method: 'POST',
    });
    return res.data;
  },

  // Grocery Catalog & Cart
  async getProducts() {
    const res = await request<{ success: boolean; data: any[] }>('/api/cart/products');
    return res.data;
  },

  async getCart() {
    const res = await request<{ success: boolean; data: any }>('/api/cart');
    return res.data;
  },

  async addToCart(productId: string, quantity = 1) {
    const res = await request<{ success: boolean; data: any }>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    return res.data;
  },

  async updateCartItem(productId: string, quantity: number) {
    const res = await request<{ success: boolean; data: any }>(`/api/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
    return res.data;
  },

  async removeFromCart(productId: string) {
    const res = await request<{ success: boolean; data: any }>(`/api/cart/items/${productId}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  // Delivery Slots
  async getSlots() {
    const res = await request<{ success: boolean; data: any[] }>('/api/slots');
    return res.data;
  },

  async resetSlot(slotId: string, capacityUsed = 0) {
    const res = await request<{ success: boolean; data: any[] }>(`/api/slots/${slotId}/reset`, {
      method: 'POST',
      body: JSON.stringify({ capacityUsed }),
    });
    return res.data;
  },

  async testSlotReservation(slotId: string) {
    const res = await request<{ success: boolean; data: any }>('/api/slots/reserve-test', {
      method: 'POST',
      body: JSON.stringify({ slotId }),
    });
    return res.data;
  },

  // Orders
  async checkout(payload: {
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    paymentMethod: string;
  }) {
    const res = await request<{ success: boolean; data: any }>('/api/order/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async getOrder(orderId: string) {
    const res = await request<{ success: boolean; data: any }>(`/api/order/${orderId}`);
    return res.data;
  },

  // Analytics
  async getFunnelMetrics() {
    const res = await request<{ success: boolean; data: any }>('/api/analytics/funnel');
    return res.data;
  },

  async trackEvent(step: string, eventType: string, metadata?: any) {
    const res = await request<{ success: boolean; message: string }>('/api/analytics/event', {
      method: 'POST',
      body: JSON.stringify({ step, eventType, metadata }),
    });
    return res;
  },
};
