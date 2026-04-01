
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../lib/apiClient';

interface DashboardStats {
    metrics: {
        totalMessages: number;
        deliveryRate: string;
        flowExecutions: number;
        revenue: number;
    };
    recentTransactions: Array<{
        user: string;
        item: string;
        amount: string;
        time: string;
    }>;
    activeBookings: Array<{
        user: string;
        role: string;
        rating: string;
        time: string;
    }>;
    chartData: Array<{
        name: string;
        total: number;
    }>;
}

interface DashboardState {
    stats: DashboardStats | null;
    loading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    stats: null,
    loading: false,
    error: null,
};

export const fetchDashboardStatsAsync = createAsyncThunk(
    'dashboard/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/dashboard/stats');
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch dashboard stats');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStatsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStatsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStatsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default dashboardSlice.reducer;
