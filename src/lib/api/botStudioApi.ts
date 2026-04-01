
import apiClient from '../apiClient';

export interface BotPersona {
    personaName: string;
    personaTone: string;
    personaPrompt: string;
    autoReplyEnabled: boolean;
    geminiApiKey?: string;
    geminiModel?: string;
    useCatalog: boolean;
    useLeadRAG: boolean;
    useStudioKnowledge: boolean;
    useAppointments: boolean;
}

export interface KnowledgeSource {
    id: string;
    title: string;
    type: 'FILE' | 'TEXT' | 'URL';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    totalChunks: number;
    productId?: string | null;
    createdAt: string;
}

export const botStudioApi = {
    // Persona Management
    getSettings: () =>
        apiClient.get('/bot-studio/settings'),

    updateSettings: (data: Partial<BotPersona>) =>
        apiClient.patch('/bot-studio/settings', data),

    // Dynamic Knowledge (RAG)
    getKnowledgeSources: () =>
        apiClient.get('/bot-studio/knowledge/sources'),

    uploadKnowledge: (data: { title: string; content: string }) =>
        apiClient.post('/bot-studio/knowledge/upload', data),

    uploadKnowledgeFile: (file: File, productId?: string | null) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        if (productId) formData.append('productId', productId);
        return apiClient.post('/bot-studio/knowledge/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    uploadKnowledgeBase64: (data: { title: string; file: string }) =>
        apiClient.post('/bot-studio/knowledge/upload', data),

    // Sandbox / Test
    testQuery: (query: string) =>
        apiClient.post('/leads/rag-query', { query }),
};
