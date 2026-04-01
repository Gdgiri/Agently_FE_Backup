import apiClient from '../apiClient';

export interface MapSearchPayload {
    query: string;
    location: string;
    radius: number; // in meters (backend requirement)
    autoEnrich?: boolean;
    hasEmail?: boolean;
    hasPhone?: boolean;
    hasWebsite?: boolean;
}

export interface EnrichLeadsPayload {
    mapLeadIds: string[];
}

export interface RAGIngestPayload {
    url: string;
}

export interface RAGQueryPayload {
    query: string;
}

export const leadIntelligenceApi = {
    // Trigger async map search — returns { jobId }
    searchMap: (payload: MapSearchPayload) =>
        apiClient.post('/leads/map/search', payload),

    // Get raw discovered leads (Optionally filtered by jobId)
    getDiscoveredLeads: (jobId?: string) => {
        const url = jobId ? `/leads/map/discovered?jobId=${jobId}` : '/leads/map/discovered';
        return apiClient.get(url);
    },

    // Trigger background enrichment + AI scoring — returns { jobId }
    enrichLeads: (payload: EnrichLeadsPayload) =>
        apiClient.post('/leads/enrich', payload),

    // Fetch all enriched leads with AI scores
    getLeads: () => apiClient.get('/leads'),

    // V3: Fetch background job details (including ephemeral results)
    getJob: (jobId: string) => apiClient.get(`/leads/jobs/${jobId}`),

    // V3: Save selected leads to database (MapLead table)
    saveSelectedLeads: (leads: any[]) => apiClient.post('/leads/map/save', { leads }),

    // RAG knowledge base integration (V1)
    ingestRAG: (payload: RAGIngestPayload) =>
        apiClient.post('/leads/rag-ingest', payload),

    getSources: () => apiClient.get('/leads/rag-sources'),

    deleteSource: (id: string) => apiClient.delete(`/leads/rag-sources/${id}`),

    getRAGStats: () => apiClient.get('/leads/rag-stats'),

    queryRAG: (payload: { question: string; query: string }) =>
        apiClient.post('/leads/rag-query', payload),
};
