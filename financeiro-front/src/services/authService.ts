// src/services/authService.ts

import api from './api';
import type {
    AuthResponse,
    LoginDTO,
    RegisterDTO,
    User,
    AlterarSenhaDTO,
    AtualizarUsuarioDTO,
} from '../types/auth';

export const authService = {
    async login(credentials: LoginDTO): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    async register(userData: RegisterDTO): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', userData);
        return response.data;
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/refresh', {
            refreshToken,
        });
        return response.data;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },

    async updateProfile(data: AtualizarUsuarioDTO): Promise<User> {
        const response = await api.put<User>('/usuarios/perfil', data);
        return response.data;
    },

    async changePassword(data: AlterarSenhaDTO): Promise<void> {
        await api.put('/usuarios/senha', data);
    },
};