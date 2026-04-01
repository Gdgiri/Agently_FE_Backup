
import apiClient from '../apiClient';

export interface Template {
    id: string;
    name: string;
    category: string;
    language: string;
    status: string;
    content: any;
    usage?: number; // Optional, might not come from API immediately
    lastUpdate?: string; // Optional
}

export const templateApi = {
    getAll: () =>
        apiClient.get('/templates'),

    create: (data: any) =>
        apiClient.post('/templates', data),

    syncFromMeta: () =>
        apiClient.post('/templates/sync-meta'),

    submitToMeta: (id: string) =>
        apiClient.post(`/templates/${id}/submit-to-meta`),

    delete: (id: string, force: boolean = false) =>
        apiClient.delete(`/templates/${id}${force ? '?force=true' : ''}`),
};
