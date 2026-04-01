
import apiClient from '../apiClient';

export const chatApi = {
    getConversations: () =>
        apiClient.get('/chat/conversations'),

    getConversationById: (id: string) =>
        apiClient.get(`/chat/conversations/${id}`),

    getMessages: (conversationId: string) =>
        apiClient.get(`/chat/conversations/${conversationId}/messages`),

    markAsRead: (conversationId: string) =>
        apiClient.post(`/chat/conversations/${conversationId}/read`),

    sendMessage: (data: { conversationId: string; content: string; type?: string }) =>
        apiClient.post('/chat/messages', { ...data, type: data.type || 'TEXT' }),
};
