
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { contactApi, tagApi } from '../lib/api/contactApi';
import { Contact, Tag } from '../types';

interface ContactState {
    contacts: Contact[];
    tags: Tag[];
    loading: boolean;
    error: string | null;
}

const initialState: ContactState = {
    contacts: [],
    tags: [],
    loading: false,
    error: null,
};

export const fetchContactsAsync = createAsyncThunk(
    'contacts/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await contactApi.getAll();
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch contacts');
        }
    }
);

export const fetchTagsAsync = createAsyncThunk(
    'tags/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await tagApi.getAll();
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch tags');
        }
    }
);

export const createContactAsync = createAsyncThunk(
    'contacts/create',
    async (payload: { phoneNumber: string; name?: string }, { rejectWithValue }) => {
        try {
            const { data } = await contactApi.create(payload);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create contact');
        }
    }
);

export const importContactsAsync = createAsyncThunk(
    'contacts/import',
    async (formData: FormData, { dispatch, rejectWithValue }) => {
        try {
            await contactApi.importCsv(formData);
            dispatch(fetchContactsAsync());
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to import contacts');
        }
    }
);

export const deleteContactAsync = createAsyncThunk(
    'contacts/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await contactApi.delete(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete contact');
        }
    }
);

export const createTagAsync = createAsyncThunk(
    'tags/create',
    async (payload: { name: string; color?: string }, { rejectWithValue }) => {
        try {
            const { data } = await tagApi.create(payload);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create tag');
        }
    }
);

const contactSlice = createSlice({
    name: 'contacts',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchContactsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContactsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.contacts = action.payload;
            })
            .addCase(fetchContactsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchTagsAsync.fulfilled, (state, action) => {
                state.tags = action.payload;
            })
            .addCase(createContactAsync.fulfilled, (state, action) => {
                state.contacts.unshift(action.payload);
            })
            .addCase(importContactsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(importContactsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteContactAsync.fulfilled, (state, action) => {
                state.contacts = state.contacts.filter(c => c.id !== action.payload);
            })
            .addCase(createTagAsync.fulfilled, (state, action) => {
                state.tags.push(action.payload);
            });
    },
});

export const { clearError } = contactSlice.actions;
export default contactSlice.reducer;
