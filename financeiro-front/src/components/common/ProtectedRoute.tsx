import type {ReactNode} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from './Loading';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <Loading fullScreen text="Verificando autenticação..." />;
    }

    if (!isAuthenticated) {
        // Redireciona para login salvando a localização atual
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && user?.tipoUsuario !== 'ADMIN') {
        // Redireciona para dashboard se não for admin
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};