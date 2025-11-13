// src/store/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, AuthResponse, User } from '../types/auth';
import { tokenManager } from '../utils/tokenManager';

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,

            setAuth: (data: AuthResponse) => {
                tokenManager.setToken(data.token);
                tokenManager.setRefreshToken(data.refreshToken);

                set({
                    user: data.usuario,
                    token: data.token,
                    refreshToken: data.refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                });
            },

            setUser: (user: User) => {
                set({ user });
            },

            clearAuth: () => {
                tokenManager.clearAll();

                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);