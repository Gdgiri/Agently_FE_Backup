
import apiClient from '../apiClient';

export const orderApi = {
    getAll: () =>
        apiClient.get('/orders'),

    getById: (id: string) =>
        apiClient.get(`/orders/${id}`),

    create: (data: { contactId: string; totalAmount: number; currency: string; items: any[] }) =>
        apiClient.post('/orders', data),
};

export const appointmentApi = {
    getAll: () =>
        apiClient.get('/appointments'),

    getById: (id: string) =>
        apiClient.get(`/appointments/${id}`),

    create: (data: { contactId: string; staffId?: string; startTime: string; endTime: string; notes?: string }) =>
        apiClient.post('/appointments', data),

    update: (id: string, data: any) =>
        apiClient.patch(`/appointments/${id}`, data),
};

export const staffApi = {
    getAll: () =>
        apiClient.get('/staff'),

    create: (data: { name: string; phoneNumber: string; role: string }) =>
        apiClient.post('/staff', data),

    update: (id: string, data: { name?: string; phoneNumber?: string; role?: string }) =>
        apiClient.patch(`/staff/${id}`, data),

    delete: (id: string) =>
        apiClient.delete(`/staff/${id}`),
};
