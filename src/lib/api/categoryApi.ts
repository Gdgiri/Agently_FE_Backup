
import apiClient from '../apiClient';

export interface Category {
    id: string;
    name: string;
    type?: string;
    tenantId: string;
}

export const categoryApi = {
    getAll: (type?: string) =>
        apiClient.get<Category[]>('/categories', { params: { type } }),

    create: (data: { name: string, type?: string }) =>
        apiClient.post<Category>('/categories', data),

    update: (id: string, data: { name: string, type?: string }) =>
        apiClient.put<Category>(`/categories/${id}`, data),

    delete: (id: string) =>
        apiClient.delete(`/categories/${id}`),

    // Type-level Management
    getTypes: () =>
        apiClient.get<string[]>('/categories/types'),

    updateType: (oldName: string, newName: string) =>
        apiClient.patch(`/categories/type/${oldName}`, { newName }),

    deleteType: (name: string) =>
        apiClient.delete(`/categories/type/${name}`)
};
