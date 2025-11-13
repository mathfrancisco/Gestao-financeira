// src/routes/AppRoutes.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ProfilePage } from '../components/auth/ProfilePage';
import { CategoriasList } from '../components/categorias/CategoriasList';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import {DashboardPage} from "../components/dashboard/Dashboard.tsx";
import LandingPage from "../components/landingpage/LandingPage.tsx";
import {ReceitasList} from "../components/receitas/ReceitasList.tsx";
import {DespesasList} from "../components/despesas/DespesasList.tsx";
import { MetaDetail } from "../components/meta/MetaDetail.tsx";
import {MetasList} from "../components/meta/MetasList.tsx";
import {ParametrosList} from "../components/parametros/ParametrosList.tsx";

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Rotas Públicas */}
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />

                {/* Rotas Protegidas */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />

                {/* Categorias */}
                <Route
                    path="/categorias"
                    element={
                        <ProtectedRoute>
                            <CategoriasList />
                        </ProtectedRoute>
                    }
                />

                {/* Rotas futuras - Receitas */}
                <Route
                    path="/receitas"
                    element={
                        <ProtectedRoute>
                            <ReceitasList />
                        </ProtectedRoute>
                    }
                />

                {/* Rotas futuras - Despesas */}
                <Route
                    path="/despesas"
                    element={
                        <ProtectedRoute>
                            <DespesasList />
                        </ProtectedRoute>
                    }
                />

                {/* Rotas futuras - Metas */}
                <Route
                    path="/metas"
                    element={
                        <ProtectedRoute>
                            <MetasList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/metas/:id"
                    element={
                        <ProtectedRoute>
                            <MetaDetail />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/parametros"
                    element={
                        <ProtectedRoute>
                            <ParametrosList />
                        </ProtectedRoute>
                    }
                />

                {/* 404 - Not Found */}
                <Route
                    path="*"
                    element={
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-6xl font-bold text-gray-900">404</h1>
                                <p className="text-xl text-gray-600 mt-4">Página não encontrada</p>
                                <a
                                    href="/dashboard"
                                    className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Voltar ao Dashboard
                                </a>
                            </div>
                        </div>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};