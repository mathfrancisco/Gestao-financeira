// src/hooks/useAuth.ts

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import type {
    LoginDTO,
    RegisterDTO,
    AlterarSenhaDTO,
    AtualizarUsuarioDTO,
} from '../types/auth';
import { tokenManager } from '../utils/tokenManager';

export const useAuth = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, token, isAuthenticated, setAuth, setUser, clearAuth } = useAuthStore();

    // Verifica autenticação ao carregar
    const { isLoading: isCheckingAuth } = useQuery({
        queryKey: ['auth', 'check'],
        queryFn: async () => {
            const storedToken = tokenManager.getToken();

            if (!storedToken || !tokenManager.isTokenValid(storedToken)) {
                clearAuth();
                return null;
            }

            try {
                const userData = await authService.getCurrentUser();
                setUser(userData);
                return userData;
            } catch (error) {
                clearAuth();
                return null;
            }
        },
        enabled: isAuthenticated && !user,
        retry: false,
    });

    // Mutation de login
    const loginMutation = useMutation({
        mutationFn: (credentials: LoginDTO) => authService.login(credentials),
        onSuccess: (data) => {
            setAuth(data);
            queryClient.invalidateQueries({ queryKey: ['auth'] });
            navigate('/dashboard');
        },
    });

    // Mutation de registro
    const registerMutation = useMutation({
        mutationFn: (userData: RegisterDTO) => authService.register(userData),
        onSuccess: (data) => {
            setAuth(data);
            queryClient.invalidateQueries({ queryKey: ['auth'] });
            navigate('/dashboard');
        },
    });

    // Mutation de logout
    const logoutMutation = useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            clearAuth();
            queryClient.clear();
            navigate('/login');
        },
        onError: () => {
            // Mesmo com erro, limpa autenticação local
            clearAuth();
            queryClient.clear();
            navigate('/login');
        },
    });

    // Mutation de atualizar perfil
    const updateProfileMutation = useMutation({
        mutationFn: (data: AtualizarUsuarioDTO) => authService.updateProfile(data),
        onSuccess: (userData) => {
            setUser(userData);
            queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
        },
    });

    // Mutation de alterar senha
    const changePasswordMutation = useMutation({
        mutationFn: (data: AlterarSenhaDTO) => authService.changePassword(data),
    });

    // Funções de conveniência
    const login = useCallback(
        (credentials: LoginDTO) => {
            return loginMutation.mutateAsync(credentials);
        },
        [loginMutation]
    );

    const register = useCallback(
        (userData: RegisterDTO) => {
            return registerMutation.mutateAsync(userData);
        },
        [registerMutation]
    );

    const logout = useCallback(() => {
        return logoutMutation.mutate();
    }, [logoutMutation]);

    const updateProfile = useCallback(
        (data: AtualizarUsuarioDTO) => {
            return updateProfileMutation.mutateAsync(data);
        },
        [updateProfileMutation]
    );

    const changePassword = useCallback(
        (data: AlterarSenhaDTO) => {
            return changePasswordMutation.mutateAsync(data);
        },
        [changePasswordMutation]
    );

    return {
        user,
        token,
        isAuthenticated,
        isLoading: isCheckingAuth || loginMutation.isPending || registerMutation.isPending,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        loginError: loginMutation.error,
        registerError: registerMutation.error,
        isLoginLoading: loginMutation.isPending,
        isRegisterLoading: registerMutation.isPending,
        isLogoutLoading: logoutMutation.isPending,
        isUpdateProfileLoading: updateProfileMutation.isPending,
        isChangePasswordLoading: changePasswordMutation.isPending,
        updateProfileError: updateProfileMutation.error,
        changePasswordError: changePasswordMutation.error,
    };
};