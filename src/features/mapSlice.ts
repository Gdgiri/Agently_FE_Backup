
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { leadIntelligenceApi, MapSearchPayload } from '../lib/api/leadIntelligenceApi';
import { addJob } from './jobSlice';

interface MapState {
    center: [number, number];
    zoom: number;
    bounds: any | null;
    searchParams: {
        query: string;
        location: string;
        radius: number;
        autoEnrich: boolean;
        hasEmail: boolean;
        hasPhone: boolean;
        hasWebsite: boolean;
    };
    discoveredLeads: any[]; // Raw leads from GET /api/leads/map/discovered
    selectedDiscoveredIds: string[]; // Selected ids for enrichment
    activePinId: string | null;
    activeJobId: string | null; // Tracks the current isolated search session backend Job ID
    loading: boolean;
    error: string | null;
}

const baseInitialState: MapState = {
    center: [20, 0], // Default global center
    zoom: 2,
    bounds: null,
    searchParams: {
        query: '',
        location: '',
        radius: 10, // km
        autoEnrich: false, // auto pilot disabled by default
        hasEmail: true,
        hasPhone: true,
        hasWebsite: true,
    },
    discoveredLeads: [],
    selectedDiscoveredIds: [],
    activePinId: null,
    activeJobId: null,
    loading: false,
    error: null,
};

// Persistence keys
const MAP_JOB_ID_KEY = 'agently_map_active_job_id';
const MAP_PARAMS_KEY = 'agently_map_search_params';

// Helper to load persisted state
const getPersistedJobId = () => localStorage.getItem(MAP_JOB_ID_KEY);
const getPersistedParams = () => {
    const saved = localStorage.getItem(MAP_PARAMS_KEY);
    try {
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
};

const persistedJobId = getPersistedJobId();
const persistedParams = getPersistedParams();

const initialState: MapState = {
    ...baseInitialState,
    activeJobId: persistedJobId,
    searchParams: persistedParams ? { ...baseInitialState.searchParams, ...persistedParams } : baseInitialState.searchParams,
};

export const searchMap = createAsyncThunk(
    'map/searchMap',
    async (payload: MapSearchPayload, { rejectWithValue, dispatch }) => {
        try {
            const response = await leadIntelligenceApi.searchMap(payload);
            const data = response.data?.data || response.data;
            console.log("Search Map Response:", data);

            // Backend is async — it returns a jobId. Track the job client-side.
            const jobId = data?.jobId || data?.id;
            if (jobId) {
                dispatch(addJob({
                    id: jobId,
                    type: 'map_search',
                    status: 'running',
                    progress: 0,
                    params: { query: payload.query, location: payload.location },
                    message: `Searching for "${payload.query}" in ${payload.location}...`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    logs: [`Search job started for query: ${payload.query} in ${payload.location}`],
                }));
            }

            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Map search failed');
        }
    }
);

export const fetchJobResults = createAsyncThunk(
    'map/fetchJobResults',
    async (jobId: string, { rejectWithValue }) => {
        try {
            const response = await leadIntelligenceApi.getJob(jobId);
            const data = response.data?.data || response.data;
            
            // Backend V3 returns { id, state, result: [...] }
            if (data?.state === 'completed' || data?.status === 'completed') {
                return Array.isArray(data.result) ? data.result : [];
            }
            
            return rejectWithValue('Job still in progress');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch job results');
        }
    }
);

export const saveSelectedLeadsToDB = createAsyncThunk(
    'map/saveSelectedLeadsToDB',
    async (leads: any[], { rejectWithValue }) => {
        try {
            const response = await leadIntelligenceApi.saveSelectedLeads(leads);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to save leads');
        }
    }
);

export const fetchDiscoveredLeads = createAsyncThunk(
    'map/fetchDiscoveredLeads',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { map: MapState };
            const jobId = state.map.activeJobId || undefined;
            if (!jobId) return [];
            
            const response = await leadIntelligenceApi.getJob(jobId);
            const data = response.data?.data || response.data;
            if (data?.result) return data.result;
            
            return [];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch discovered leads');
        }
    }
);

const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
        setMapViewport: (state, action: PayloadAction<{ center: [number, number]; zoom: number }>) => {
            state.center = action.payload.center;
            state.zoom = action.payload.zoom;
        },
        setSearchParams: (state, action: PayloadAction<Partial<MapState['searchParams']>>) => {
            state.searchParams = { ...state.searchParams, ...action.payload };
            localStorage.setItem(MAP_PARAMS_KEY, JSON.stringify(state.searchParams));
        },
        setActivePinId: (state, action: PayloadAction<string | null>) => {
            state.activePinId = action.payload;
        },
        setActiveJobId: (state, action: PayloadAction<string | null>) => {
            state.activeJobId = action.payload;
            if (action.payload) {
                localStorage.setItem(MAP_JOB_ID_KEY, action.payload);
            } else {
                localStorage.removeItem(MAP_JOB_ID_KEY);
            }
        },
        toggleDiscoveredLeadSelection: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            if (state.selectedDiscoveredIds.includes(id)) {
                state.selectedDiscoveredIds = state.selectedDiscoveredIds.filter(i => i !== id);
            } else {
                state.selectedDiscoveredIds.push(id);
            }
        },
        selectAllDiscoveredLeads: (state, action: PayloadAction<string[]>) => {
            state.selectedDiscoveredIds = action.payload;
        },
        deselectAllDiscoveredLeads: (state) => {
            state.selectedDiscoveredIds = [];
        },
        clearMapError: (state) => {
            state.error = null;
        },
        clearActiveJobId: (state) => {
            state.activeJobId = null;
            localStorage.removeItem(MAP_JOB_ID_KEY);
        },
        removeDiscoveredLead: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            state.discoveredLeads = state.discoveredLeads.filter(l => l.id !== id);
            state.selectedDiscoveredIds = state.selectedDiscoveredIds.filter(i => i !== id);
            if (state.activePinId === id) {
                state.activePinId = null;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchMap.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.activePinId = null;
            })
            .addCase(searchMap.fulfilled, (state, action) => {
                state.loading = false;
                // Capture the backend's generated jobId so we can isolate the upcoming fetch
                const payload = action.payload as any;
                const jobId = payload?.jobId || payload?.id;
                if (jobId) {
                    state.activeJobId = jobId;
                    localStorage.setItem(MAP_JOB_ID_KEY, jobId);
                }
            })
            .addCase(searchMap.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchDiscoveredLeads.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDiscoveredLeads.fulfilled, (state, action) => {
                state.loading = false;
                state.discoveredLeads = action.payload;
                // Keep selected ids that still exist in the new fetch
                state.selectedDiscoveredIds = state.selectedDiscoveredIds.filter(id => 
                    action.payload.some((l: any) => l.id === id || l.place_id === id)
                );
            })
            .addCase(fetchDiscoveredLeads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchJobResults.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobResults.fulfilled, (state, action) => {
                state.loading = false;
                state.discoveredLeads = action.payload;
            })
            .addCase(fetchJobResults.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(saveSelectedLeadsToDB.pending, (state) => {
                state.loading = true;
            })
            .addCase(saveSelectedLeadsToDB.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(saveSelectedLeadsToDB.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { 
    setMapViewport, 
    setSearchParams, 
    setActivePinId, 
    setActiveJobId,
    toggleDiscoveredLeadSelection,
    selectAllDiscoveredLeads,
    deselectAllDiscoveredLeads,
    clearMapError,
    clearActiveJobId,
    removeDiscoveredLead
} = mapSlice.actions;
export default mapSlice.reducer;
