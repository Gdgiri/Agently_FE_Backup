
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tenantApi } from '../lib/api/miscApi';
import { Tenant } from '../types';

interface TenantState {
    currentTenant: Tenant | null;
    tenants: Tenant[];
    loading: boolean;
    error: string | null;
}

const initialState: TenantState = {
    currentTenant: null,
    tenants: [],
    loading: false,
    error: null,
};

export const fetchTenantsAsync = createAsyncThunk(
    'tenant/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await tenantApi.getTenants();
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch tenants');
        }
    }
);

const tenantSlice = createSlice({
    name: 'tenant',
    initialState,
    reducers: {
        setTenant: (state, action: PayloadAction<Tenant>) => {
            state.currentTenant = action.payload;
            localStorage.setItem('tenantId', action.payload.id);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTenantsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenantsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.tenants = action.payload || [];
                // Auto-select first tenant if none active
                if (!state.currentTenant && action.payload?.length > 0) {
                    state.currentTenant = action.payload[0];
                    localStorage.setItem('tenantId', action.payload[0].id);
                }
            })
            .addCase(fetchTenantsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setTenant } = tenantSlice.actions;
export default tenantSlice.reducer;
