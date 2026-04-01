import apiClient from '../apiClient';

export const catalogApi = {
    getAll: () =>
        apiClient.get('/catalogs'),

    getSettings: () =>
        apiClient.get('/catalogs/settings'),

    saveSettings: (data: { businessId?: string; catalogToken?: string }) =>
        apiClient.post('/catalogs/settings', data),

    /** Link an existing Meta catalog by its ID */
    link: (name: string, metaCatalogId: string) =>
        apiClient.post('/catalogs/link', { name, metaCatalogId }),

    /** Create a new catalog on Meta (requires catalog_management token in settings) */
    create: (name: string, businessId?: string) =>
        apiClient.post('/catalogs', { name, businessId }),

    setDefault: (id: string) =>
        apiClient.post(`/catalogs/${id}/set-default`)
};
