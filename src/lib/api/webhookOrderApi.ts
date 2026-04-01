import apiClient from '../apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WebhookOrder {
    id: string;
    clientId: string;
    orderId: string | null;
    customerName: string | null;
    phone: string | null;
    total: number | null;
    orderStatus: string | null;
    paymentStatus: string | null;
    paymentMethod: string | null;
    paymentAmount: number | null;
    paidAt: string | null;
    rawPayload: Record<string, unknown>;
    source: string;
    createdAt: string;
    updatedAt: string;
}

export interface WebhookOrdersResponse {
    success: boolean;
    data: WebhookOrder[];
}

export interface WebhookOrderResponse {
    success: boolean;
    data: WebhookOrder;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const webhookOrderApi = {
    /** GET /webhook-orders — fetch all orders sorted newest first */
    getAll: () =>
        apiClient.get<WebhookOrdersResponse>('/webhook-orders'),

    /** GET /webhook-orders/:id — fetch single order with rawPayload */
    getById: (id: string) =>
        apiClient.get<WebhookOrderResponse>(`/webhook-orders/${id}`),
};
