import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// Interceptor to attach token if it exists in localStorage and hasn't been set by AuthContext yet
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string;
    category?: string;
}

export interface CartItemRequest {
    productId: string;
    quantity: number;
}

export interface OrderRequest {
    items: CartItemRequest[];
    shippingAddress: string;
    paymentMethod: string;
}

export const getProducts = async (page = 0, size = 10) => {
    const response = await api.get(`/v1/products?page=${page}&size=${size}`);
    return response.data;
};

export const createOrder = async (orderRequest: OrderRequest) => {
    const idempotencyKey = crypto.randomUUID();
    const response = await api.post('/v1/orders', orderRequest, {
        headers: {
            'Idempotency-Key': idempotencyKey
        }
    });
    return response.data;
};

export const getMe = async () => {
    const response = await api.get('/v1/auth/me');
    return response.data;
};

export const getMyOrders = async () => {
    const response = await api.get('/v1/orders/my');
    return response.data;
};

export const getAllOrders = async () => {
    const response = await api.get('/v1/orders');
    return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
    const response = await api.patch(`/v1/orders/${orderId}/status`, { status });
    return response.data;
};

export const updateProduct = async (productId: string, product: Omit<Product, 'id'>) => {
    const response = await api.put(`/v1/products/${productId}`, product);
    return response.data;
};

export const deleteProduct = async (productId: string) => {
    const response = await api.delete(`/v1/products/${productId}`);
    return response.data;
};

export const getSystemStatus = async () => {
    const response = await api.get('/v1/admin/status');
    return response.data;
};

export default api;
