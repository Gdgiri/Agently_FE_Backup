import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { leadIntelligenceApi } from '../lib/api/leadIntelligenceApi';
import { addJob } from './jobSlice';

export interface RAGSource {
    id: string;
    url: string;
    crawlStatus: 'queued' | 'processing' | 'completed' | 'failed';
    totalChunks: number;
    createdAt: string;
}

export interface RAGStats {
    totalChunksInDatabase: number;
    activeSourcesCount: number;
    averageQueryLatencyMs?: number;
}

interface RAGState {
    sources: RAGSource[];
    stats: RAGStats | null;
    loading: boolean;
    error: string | null;
    testQueryResult: string | null;
    testQuerySources: any[] | null;
    testQueryLoading: boolean;
    testQueryError: string | null;
}

const initialState: RAGState = {
    sources: [],
    stats: null,
    loading: false,
    error: null,
    testQueryResult: null,
    testQuerySources: null,
    testQueryLoading: false,
    testQueryError: null,
};

export const fetchSources = createAsyncThunk(
    'rag/fetchSources',
    async (_, { rejectWithValue }) => {
        try {
            const response = await leadIntelligenceApi.getSources();
            return response.data?.data || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch sources');
        }
    }
);

export const fetchRAGStats = createAsyncThunk(
    'rag/fetchRAGStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await leadIntelligenceApi.getRAGStats();
            return response.data?.data || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
        }
    }
);

export const ingestRAG = createAsyncThunk(
    'rag/ingestRAG',
    async (payload: { url: string }, { rejectWithValue, dispatch }) => {
        try {
            const response = await leadIntelligenceApi.ingestRAG(payload);
            const data = response.data?.data || response.data;

            const jobId = data?.jobId || data?.id;
            if (jobId) {
                dispatch(addJob({
                    id: jobId,
                    type: 'rag_ingest',
                    status: 'running',
                    progress: 0,
                    message: `Ingesting knowledge from ${payload.url}...`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    logs: [`RAG ingestion started for: ${payload.url}`],
                }));
            }

            // Refresh sources immediately
            dispatch(fetchSources());

            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ingestion failed');
        }
    }
);

export const deleteSource = createAsyncThunk(
    'rag/deleteSource',
    async (id: string, { rejectWithValue, dispatch }) => {
        try {
            await leadIntelligenceApi.deleteSource(id);
            dispatch(fetchSources());
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Deletion failed');
        }
    }
);

export const queryRAG = createAsyncThunk(
    'rag/queryRAG',
    async (payload: { question: string }, { rejectWithValue }) => {
        try {
            const response = await leadIntelligenceApi.queryRAG({
                question: payload.question,
                query: payload.question // Send as both for compatibility
            });
            return response.data?.data || response.data; 
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Knowledge query failed');
        }
    }
);

const ragSlice = createSlice({
    name: 'rag',
    initialState,
    reducers: {
        setSources: (state, action: PayloadAction<RAGSource[]>) => {
            state.sources = action.payload;
        },
        clearRageError: (state) => {
            state.error = null;
        },
        clearTestQuery: (state) => {
            state.testQueryResult = null;
            state.testQuerySources = null;
            state.testQueryError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSources.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSources.fulfilled, (state, action) => {
                state.loading = false;
                state.sources = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchSources.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchRAGStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })
            .addCase(ingestRAG.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(ingestRAG.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(ingestRAG.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(queryRAG.pending, (state) => {
                state.testQueryLoading = true;
                state.testQueryError = null;
                state.testQueryResult = null;
                state.testQuerySources = null;
            })
            .addCase(queryRAG.fulfilled, (state, action) => {
                state.testQueryLoading = false;
                state.testQueryResult = action.payload?.answer || action.payload?.aiResponse;
                state.testQuerySources = action.payload?.retrievedChunks || action.payload?.sourcesUsed || [];
            })
            .addCase(queryRAG.rejected, (state, action) => {
                state.testQueryLoading = false;
                state.testQueryError = action.payload as string;
            });
    }
});

export const { setSources, clearRageError, clearTestQuery } = ragSlice.actions;
export default ragSlice.reducer;
