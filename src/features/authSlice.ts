
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, LoginPayload, RegisterPayload, AuthResponse } from '../lib/api/authApi';
import { User } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    token: string | null;
}

// --- Restore session from localStorage ---
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

const initialState: AuthState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    isAuthenticated: !!storedToken,
    loading: false,
    error: null,
    token: storedToken,
};

// --- Async Thunks ---
export const loginAsync = createAsyncThunk(
    'auth/login',
    async (payload: LoginPayload, { rejectWithValue }) => {
        try {
            const { data } = await authApi.login(payload);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Login failed');
        }
    }
);

export const registerAsync = createAsyncThunk(
    'auth/register',
    async (payload: RegisterPayload, { rejectWithValue }) => {
        try {
            const { data } = await authApi.register(payload);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Registration failed');
        }
    }
);

export const firebaseLoginAsync = createAsyncThunk(
    'auth/firebaseLogin',
    async (idToken: string, { rejectWithValue }) => {
        try {
            const { data } = await authApi.firebaseLogin(idToken);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Firebase login failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.token = null;
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tenantId');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // LOGIN
            .addCase(loginAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = {
                    id: action.payload.user.id,
                    name: action.payload.user.name,
                    email: action.payload.user.email,
                    role: action.payload.user.role as 'ADMIN' | 'MANAGER' | 'AGENT',
                    tenantId: action.payload.user.tenantId,
                };

                // Persist to localStorage
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('refreshToken', action.payload.refreshToken);
                localStorage.setItem('user', JSON.stringify(state.user));
            })
            .addCase(loginAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // FIREBASE LOGIN
            .addCase(firebaseLoginAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(firebaseLoginAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = {
                    id: action.payload.user.id,
                    name: action.payload.user.name,
                    email: action.payload.user.email,
                    role: action.payload.user.role as 'ADMIN' | 'MANAGER' | 'AGENT',
                    tenantId: action.payload.user.tenantId,
                };

                // Persist to localStorage
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('refreshToken', action.payload.refreshToken);
                localStorage.setItem('user', JSON.stringify(state.user));
            })
            .addCase(firebaseLoginAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // REGISTER
            .addCase(registerAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerAsync.fulfilled, (state) => {
                state.loading = false;
                // Registration successful — user should now login
            })
            .addCase(registerAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
