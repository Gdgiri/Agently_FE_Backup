
import apiClient from '../apiClient';

export const aiApi = {
    generateFlow: (prompt: string) =>
        apiClient.post('/ai/generate-flow', { prompt }),

    generateTemplate: (prompt: string) =>
        apiClient.post('/ai/generate-template', { prompt }),

    generateRule: (prompt: string) =>
        apiClient.post('/ai/generate-rule', { prompt }),

    chatAssist: (prompt: string, context?: any) =>
        apiClient.post('/ai/chat-assist', { prompt, context }),

    // Bot Studio
    testPersona: (persona: { name: string; tone: string; basePrompt: string }, message: string) =>
        apiClient.post('/ai/test-persona', { persona, message }),

    analyzeIntent: (message: string) =>
        apiClient.post('/ai/analyze-intent', { message }),

    getSettings: () =>
        apiClient.get('/ai/settings'),

    updateSettings: (settings: {
        personaName?: string;
        personaTone?: string;
        personaPrompt?: string;
        autoReplyEnabled?: boolean;
        geminiApiKey?: string;
        geminiModel?: string;
    }) =>
        apiClient.post('/ai/settings', settings),
};

export const campaignApi = {
    getAll: () =>
        apiClient.get('/campaigns'),

    getById: (id: string) =>
        apiClient.get(`/campaigns/${id}`),

    create: (data: { name: string; templateId: string; audience: any; scheduledAt?: string }) =>
        apiClient.post('/campaigns', data),

    execute: (id: string) =>
        apiClient.post(`/campaigns/${id}/execute`),
};

export const webhookApi = {
    getAll: () =>
        apiClient.get('/webhooks'),

    register: (data: { url: string; eventTypes: string[] }) =>
        apiClient.post('/webhooks/register', data),

    delete: (id: string) =>
        apiClient.delete(`/webhooks/${id}`),
};

export const ragApi = {
    getSources: () =>
        apiClient.get('/rag/sources'),

    ingest: (data: { url: string }) =>
        apiClient.post('/rag/ingest', data),

    updateSource: (id: string, data: any) =>
        apiClient.patch(`/rag/sources/${id}`, data),

    deleteSource: (id: string) =>
        apiClient.delete(`/rag/sources/${id}`),
};

export const tenantApi = {
    getTenants: () => apiClient.get('/auth/tenants'),
    getSettings: () => apiClient.get('/tenant/settings'),
    updateSettings: (data: any) => apiClient.patch('/tenant/settings', data),
    testConnection: () => apiClient.post('/tenant/connection-test'),
    getApiKeys: () => apiClient.get('/tenant/api-keys'),
    generateApiKey: (name?: string) => apiClient.post('/tenant/api-keys', { name }),
    revokeApiKey: (id: string) => apiClient.delete(`/tenant/api-keys/${id}`),
};
