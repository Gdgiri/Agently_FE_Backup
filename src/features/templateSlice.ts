
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { templateApi } from '../lib/api/templateApi';
import { Template } from '../types';

interface TemplateState {
    templates: Template[];
    loading: boolean;
    error: string | null;
}

const initialState: TemplateState = {
    templates: [],
    loading: false,
    error: null,
};

export const fetchTemplatesAsync = createAsyncThunk(
    'templates/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await templateApi.getAll();
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch templates');
        }
    }
);

const templateSlice = createSlice({
    name: 'templates',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTemplatesAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTemplatesAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.templates = action.payload;
            })
            .addCase(fetchTemplatesAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default templateSlice.reducer;
