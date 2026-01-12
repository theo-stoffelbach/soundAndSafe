import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
};

// Products
export const productsApi = {
  getAll: (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
    featured?: boolean;
    active?: boolean;
  }) => api.get('/products', { params }),
  getBySlug: (slug: string) => api.get(`/products/slug/${slug}`),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  restore: (id: string) => api.post(`/products/${id}/restore`),
  getLowStock: () => api.get('/products/admin/low-stock'),
};

// Categories
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Orders
export const ordersApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: { items: { productId: string; quantity: number }[]; addressId: string; notes?: string }) =>
    api.post('/orders', data),
  createTest: (data: { items: { productId: string; quantity: number }[]; addressId: string; notes?: string }) =>
    api.post('/orders/test', data), // Mode test sans PayPal
  cancel: (id: string) => api.post(`/orders/${id}/cancel`),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
};

// Users (admin)
export const usersApi = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  updateRole: (id: string, role: string) => api.put(`/users/${id}/role`, { role }),
};

// Addresses
export const addressesApi = {
  getAll: () => api.get('/users/me/addresses'),
  create: (data: any) => api.post('/users/me/addresses', data),
  update: (id: string, data: any) => api.put(`/users/me/addresses/${id}`, data),
  delete: (id: string) => api.delete(`/users/me/addresses/${id}`),
};

// Stats (admin)
export const statsApi = {
  getDashboard: () => api.get('/stats/dashboard'),
  getSales: (period?: number) => api.get('/stats/sales', { params: { period } }),
  getTopProducts: (limit?: number) => api.get('/stats/top-products', { params: { limit } }),
  getOrdersByStatus: () => api.get('/stats/orders-by-status'),
  getRecentOrders: () => api.get('/stats/recent-orders'),
};

// PayPal
export const paypalApi = {
  getClientId: () => api.get('/paypal/client-id'),
  createOrder: (orderId: string) => api.post('/paypal/create-order', { orderId }),
  captureOrder: (paypalOrderId: string) => api.post('/paypal/capture-order', { paypalOrderId }),
};
