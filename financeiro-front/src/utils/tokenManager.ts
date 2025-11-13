// src/utils/tokenManager.ts

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const tokenManager = {
    setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    removeToken(): void {
        localStorage.removeItem(TOKEN_KEY);
    },

    setRefreshToken(refreshToken: string): void {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },

    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    removeRefreshToken(): void {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    clearAll(): void {
        this.removeToken();
        this.removeRefreshToken();
    },

    isTokenValid(token?: string): boolean {
        const tokenToCheck = token || this.getToken();
        if (!tokenToCheck) return false;

        try {
            const payload = this.decodeToken(tokenToCheck);
            if (!payload || !payload.exp) return false;

            // Verifica se o token expirou (exp está em segundos)
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp > currentTime;
        } catch (error) {
            return false;
        }
    },

    decodeToken(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            if (!base64Url) return null;

            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            return null;
        }
    },

    getTokenExpiration(token?: string): number | null {
        const tokenToCheck = token || this.getToken();
        if (!tokenToCheck) return null;

        const payload = this.decodeToken(tokenToCheck);
        return payload?.exp || null;
    },
};