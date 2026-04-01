
import apiClient from '../apiClient';

export const contactApi = {
    getAll: () =>
        apiClient.get('/contacts'),

    getById: (id: string) =>
        apiClient.get(`/contacts/${id}`),

    create: (data: { phoneNumber: string; name?: string }) =>
        apiClient.post('/contacts', data),

    update: (id: string, data: { name?: string; email?: string; company?: string; phoneNumber?: string }) =>
        apiClient.patch(`/contacts/${id}`, data),

    addTag: (contactId: string, tagId: string) =>
        apiClient.post(`/contacts/${contactId}/tags`, { tagId }),

    removeTag: (contactId: string, tagId: string) =>
        apiClient.delete(`/contacts/${contactId}/tags/${tagId}`),
    importCsv: (formData: FormData) =>
        apiClient.post('/contacts/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    delete: (id: string) =>
        apiClient.delete(`/contacts/${id}`),
};

export const tagApi = {
    getAll: () =>
        apiClient.get('/tags'),

    create: (data: { name: string; color?: string }) =>
        apiClient.post('/tags', data),

    delete: (id: string) =>
        apiClient.delete(`/tags/${id}`),
};
