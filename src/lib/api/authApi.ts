
import apiClient from '../apiClient';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    name: string;
    tenantName: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        tenantId: string;
    };
}

export const authApi = {
    login: (payload: LoginPayload) =>
        apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', payload),

    register: (payload: RegisterPayload) =>
        apiClient.post<{ success: boolean; data: { userId: string; tenantId: string } }>('/auth/register', payload),

    refreshToken: (refreshToken: string) =>
        apiClient.post<{ success: boolean; data: { token: string } }>('/auth/refresh-token', { refreshToken }),

    firebaseLogin: (idToken: string) =>
        apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/firebase-login', { idToken }),
};
