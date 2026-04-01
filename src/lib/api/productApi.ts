
import apiClient from '../apiClient';
import { Product } from '../../types';

export const productApi = {
    getAll: () =>
        apiClient.get('/products'),

    getById: (id: string) =>
        apiClient.get(`/products/${id}`),

    create: (data: Partial<Product>) =>
        apiClient.post('/products', data),

    update: (id: string, data: Partial<Product>) =>
        apiClient.put(`/products/${id}`, data),

    delete: (id: string) =>
        apiClient.delete(`/products/${id}`),

    syncCatalogue: () =>
        apiClient.post('/products/sync-meta'),

    uploadKnowledge: (productId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post(`/products/${productId}/knowledge`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};
