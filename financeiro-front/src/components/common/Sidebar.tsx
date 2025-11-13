// src/components/common/Sidebar.tsx

import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    Target,
    FolderOpen,
    Settings,
    X,
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose?: () => void;
}

interface NavItem {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
}

const navigationItems: NavItem[] = [
    {
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        name: 'Receitas',
        path: '/receitas',
        icon: TrendingUp,
    },
    {
        name: 'Despesas',
        path: '/despesas',
        icon: TrendingDown,
    },
    {
        name: 'Metas',
        path: '/metas',
        icon: Target,
    },
    {
        name: 'Categorias',
        path: '/categorias',
        icon: FolderOpen,
    },
    {
        name: 'Parâmetros',
        path: '/parametros',
        icon: Settings,
    },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    return (
        <>
            {/* Overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Desktop */}
            <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 flex-shrink-0">
                <div className="flex flex-col h-full sticky top-16">
                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {navigationItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                                        <span className="flex-1">{item.name}</span>
                                        {item.badge && (
                                            <span
                                                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                    isActive
                                                        ? 'bg-white bg-opacity-20 text-white'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-900 mb-1">
                                💡 Dica do dia
                            </p>
                            <p className="text-xs text-gray-600">
                                Organize suas despesas por categoria para um melhor controle
                                financeiro.
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Sidebar Mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 lg:hidden"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header - Mobile only */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                    aria-label="Close menu"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                                {navigationItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => onClose?.()}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                                                <span className="flex-1">{item.name}</span>
                                                {item.badge && (
                                                    <span
                                                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                            isActive
                                                                ? 'bg-white bg-opacity-20 text-white'
                                                                : 'bg-blue-100 text-blue-700'
                                                        }`}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </nav>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-200">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-gray-900 mb-1">
                                        💡 Dica do dia
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Organize suas despesas por categoria para um melhor controle
                                        financeiro.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
};