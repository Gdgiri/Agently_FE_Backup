
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { leadIntelligenceApi } from '../lib/api/leadIntelligenceApi';
import { addJob } from './jobSlice';

export interface Lead {
    id: string;
    name: string;
    phone?: string | string[];
    phoneNumber?: string | string[];
    location: string;
    address?: string;
    rating: number;
    website?: string;
    source: string;
    status: 'new' | 'contacted' | 'qualified' | 'disqualified' | 'enriched';
    score?: number;
    email?: string | string[];
    socialLinks?: {
        linkedin?: string;
        facebook?: string;
        instagram?: string;
        whatsapp?: string; // Phase 1: Deep Crawl WhatsApp Direct
    };
    scraped?: {
        techStack?: string[];
        screenshotUrl?: string; // Phase 3: AI-Vision Screenshot
    };
    aiScore?: {
        score: number;
        reasons: string[];
    };
    tags: string[];
}

interface LeadState {
    leads: Lead[];
    selectedLeadIds: string[];
    filters: {
        search: string;
        location: string;
        minRating: number;
        status: string;
    };
    loading: boolean;
    error: string | null;
}

const initialState: LeadState = {
    leads: [],
    selectedLeadIds: [],
    filters: {
        search: '',
        location: '',
        minRating: 0,
        status: 'all',
    },
    loading: false,
    error: null,
};

export const fetchLeads = createAsyncThunk(
    'leads/fetchLeads',
    async (_, { rejectWithValue }) => {
        try {
            // Fetch enriched leads AND raw discovered leads in parallel.
            // Enriched leads from /leads have no address/phone — those fields live in the
            // raw discovered lead. We join them via the mapLeadId foreign key.
            const [leadsRes, discoveredRes] = await Promise.all([
                leadIntelligenceApi.getLeads(),
                leadIntelligenceApi.getDiscoveredLeads(),
            ]);

            const payload    = leadsRes.data?.data ?? leadsRes.data;
            const leadsArray = Array.isArray(payload) ? payload : [];

            // Build a quick-lookup map  mapLeadId → discovered lead
            const discoveredPayload = discoveredRes.data?.data ?? discoveredRes.data;
            const discoveredArray   = Array.isArray(discoveredPayload) ? discoveredPayload : [];
            const discoveredMap: Record<string, any> = {};
            for (const dl of discoveredArray) {
                const key = dl.id || dl.placeId || dl.place_id;
                if (key) discoveredMap[key] = dl;
            }

            return leadsArray.map((lead: any) => {
                // Find the original discovered lead by mapLeadId
                const raw = lead.mapLeadId ? discoveredMap[lead.mapLeadId] : null;

                const location =
                    lead.location || lead.mlocation || lead.formatted_address ||
                    lead.address  || lead.city       || lead.area             ||
                    raw?.address  || raw?.formatted_address || raw?.vicinity  || raw?.location || '';

                const phone =
                    lead.phone      || lead.phone_number  || lead.phoneNumber  ||
                    lead.contact_no || lead.contactNo     || lead.mobile       || lead.telephone ||
                    raw?.phone      || raw?.phoneNumber   || raw?.phone_number ||
                    raw?.contact_no || raw?.mobile        || '';

                return {
                    ...lead,
                    website: lead.website || raw?.website || raw?.websiteUrl || '',
                    rating:  lead.rating  ?? raw?.rating ?? 0,
                    aiScore: lead.leadScores?.length ? lead.leadScores[0] : lead.aiScore,
                    location,
                    phone,
                    photos: lead.photos || raw?.photos,
                    icon: lead.icon || raw?.icon,
                };
            });
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads');
        }
    }
);

export const enrichLeads = createAsyncThunk(
    'leads/enrichLeads',
    async (mapLeadIds: string[], { rejectWithValue, dispatch }) => {
        try {
            const response = await leadIntelligenceApi.enrichLeads({ mapLeadIds });
            const data = response.data?.data || response.data;

            // Backend is async — it returns a jobId. Track the job client-side.
            const jobId = data?.jobId || data?.id;
            if (jobId) {
                dispatch(addJob({
                    id: jobId,
                    type: 'enrich',
                    status: 'running',
                    progress: 0,
                    message: `Enriching ${mapLeadIds.length} lead(s) with AI scoring...`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    logs: [`Enrichment job started for ${mapLeadIds.length} lead(s)`],
                }));
            }

            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Enrichment failed');
        }
    }
);

const leadSlice = createSlice({
    name: 'leads',
    initialState,
    reducers: {
        setLeads: (state, action: PayloadAction<Lead[]>) => {
            state.leads = action.payload;
        },
        toggleLeadSelection: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            if (state.selectedLeadIds.includes(id)) {
                state.selectedLeadIds = state.selectedLeadIds.filter(i => i !== id);
            } else {
                state.selectedLeadIds.push(id);
            }
        },
        setSelectedLeads: (state, action: PayloadAction<string[]>) => {
            state.selectedLeadIds = action.payload;
        },
        setFilters: (state, action: PayloadAction<Partial<LeadState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeads.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLeads.fulfilled, (state, action) => {
                state.loading = false;
                state.leads = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchLeads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(enrichLeads.pending, (state) => {
                state.loading = true;
            })
            .addCase(enrichLeads.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(enrichLeads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { setLeads, toggleLeadSelection, setSelectedLeads, setFilters, clearError } = leadSlice.actions;
export default leadSlice.reducer;
