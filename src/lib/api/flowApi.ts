
import apiClient from '../apiClient';

export const flowApi = {
    getAll: (channel?: string) =>
        apiClient.get(`/flows${channel ? `?channel=${channel}` : ''}`),

    getById: (id: string) =>
        apiClient.get(`/flows/${id}`),

    create: (data: { name: string; triggerType: string; channel: string; nodes: any[]; edges: any[] }) =>
        apiClient.post('/flows', data),

    update: (id: string, data: any) =>
        apiClient.put(`/flows/${id}`, data),

    delete: (id: string) =>
        apiClient.delete(`/flows/${id}`),

    toggleEnabled: (id: string, isEnabled: boolean) =>
        apiClient.patch(`/flows/${id}/toggle`, { isEnabled }),
};
