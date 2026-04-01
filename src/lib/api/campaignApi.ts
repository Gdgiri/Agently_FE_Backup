
import apiClient from '../apiClient';

export const campaignApi = {
    getAll: () => apiClient.get('/campaigns'),
    getById: (id: string) => apiClient.get(`/campaigns/${id}`),
    create: (data: { 
        name: string; 
        templateId?: string; 
        channel: string;
        audience: { tagIds?: string[]; contactIds?: string[] }; 
        templateParams?: string[];
        triggerKeywords?: string;
        serviceInterest?: string;
        scheduledAt?: string 
    }) =>
        apiClient.post('/campaigns', data),
    update: (id: string, data: any) => apiClient.put(`/campaigns/${id}`, data),
    delete: (id: string) => apiClient.delete(`/campaigns/${id}`),
    execute: (id: string) => apiClient.post(`/campaigns/${id}/execute`),
};
