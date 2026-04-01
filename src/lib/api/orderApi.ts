import apiClient from '../apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderItem {
    id: string;
    productName: string;
    quantity: number;
    price: string;
}

export interface Contact {
    name: string | null;
    phoneNumber: string | null;
    address?: string | null;
}

export interface Staff {
    id: string;
    name: string;
    role: string | null;
}

export interface Order {
    id: string;
    totalAmount: string; //Backend returns decimal as string
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
    contact: Contact;
    staff: Staff | null;
    items: OrderItem[];
}

export interface OrdersResponse {
    success: boolean;
    data: Order[];
}

export interface OrderResponse {
    success: boolean;
    data: Order;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const orderApi = {
    /** GET /orders — fetch all native orders */
    getAll: () =>
        apiClient.get<OrdersResponse>('/orders'),

    /** GET /orders/:id — fetch single native order with items */
    getById: (id: string) =>
        apiClient.get<OrderResponse>(`/orders/${id}`),

    /** PATCH /orders/:id/status — update order status */
    updateStatus: (id: string, status: Order['status']) =>
        apiClient.patch<{ success: boolean }>(`/orders/${id}/status`, { status }),

    /** DELETE /orders/:id — delete a native order */
    delete: (id: string) =>
        apiClient.delete<{ success: boolean }>(`/orders/${id}`),
};
