
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { campaignApi } from '../lib/api/campaignApi';
import { Campaign } from '../types';

interface CampaignState {
    campaigns: Campaign[];
    loading: boolean;
    error: string | null;
}

const initialState: CampaignState = {
    campaigns: [],
    loading: false,
    error: null,
};

export const fetchCampaignsAsync = createAsyncThunk(
    'campaigns/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await campaignApi.getAll();
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch campaigns');
        }
    }
);

export const createCampaignAsync = createAsyncThunk(
    'campaigns/create',
    async (payload: { 
        name: string; 
        templateId?: string; 
        channel: string;
        audience: { tagIds?: string[]; contactIds?: string[] }; 
        templateParams?: string[];
        triggerKeywords?: string;
        serviceInterest?: string;
        scheduledAt?: string 
    }, { rejectWithValue }) => {
        try {
            const { data } = await campaignApi.create(payload);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create campaign');
        }
    }
);

export const executeCampaignAsync = createAsyncThunk(
    'campaigns/execute',
    async (id: string, { rejectWithValue }) => {
        try {
            const { data } = await campaignApi.execute(id);
            return { id, result: data.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to execute campaign');
        }
    }
);

export const fetchCampaignByIdAsync = createAsyncThunk(
    'campaigns/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const { data } = await campaignApi.getById(id);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch campaign details');
        }
    }
);

export const deleteCampaignAsync = createAsyncThunk(
    'campaigns/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await campaignApi.delete(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete campaign');
        }
    }
);

export const updateCampaignAsync = createAsyncThunk(
    'campaigns/update',
    async ({ id, data: updateData }: { id: string, data: any }, { rejectWithValue }) => {
        try {
            const { data } = await campaignApi.update(id, updateData);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update campaign');
        }
    }
);

const campaignSlice = createSlice({
    name: 'campaigns',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCampaignsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCampaignsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.campaigns = action.payload;
            })
            .addCase(fetchCampaignsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createCampaignAsync.fulfilled, (state, action) => {
                state.campaigns.unshift(action.payload);
            })
            .addCase(deleteCampaignAsync.fulfilled, (state, action) => {
                state.campaigns = state.campaigns.filter(c => c.id !== action.payload);
            })
            .addCase(updateCampaignAsync.fulfilled, (state, action) => {
                const index = state.campaigns.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.campaigns[index] = action.payload;
                }
            });
    },
});

export default campaignSlice.reducer;
