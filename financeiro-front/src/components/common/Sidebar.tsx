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
    Sparkles,
} from 'lucide-react';
import * as React from "react";

interface SidebarProps {
    isOpen: boolean;
    onClose?: () => void;
}

interface NavItem {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
}

const navigationItems: NavItem[] = [
    {
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        gradient: 'from-blue-500 to-cyan-500'
    },
    {
        name: 'Receitas',
        path: '/receitas',
        icon: TrendingUp,
        gradient: 'from-green-500 to-emerald-500'
    },
    {
        name: 'Despesas',
        path: '/despesas',
        icon: TrendingDown,
        gradient: 'from-red-500 to-rose-500'
    },
    {
        name: 'Metas',
        path: '/metas',
        icon: Target,
        gradient: 'from-purple-500 to-pink-500'
    },
    {
        name: 'Categorias',
        path: '/categorias',
        icon: FolderOpen,
        gradient: 'from-orange-500 to-amber-500'
    },
    {
        name: 'Parâmetros',
        path: '/parametros',
        icon: Settings,
        gradient: 'from-gray-500 to-slate-500'
    },
];

const sidebarVariants = {
    open: {
        x: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    },
    closed: {
        x: -280,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    }
};

const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
};

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    // @ts-ignore
    return (
        <>
            {/* Overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={overlayVariants}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-shrink-0">
                <div className="flex flex-col h-full w-full sticky top-16">
                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigationItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                                        isActive
                                            ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg shadow-' + item.gradient.split(' ')[1] + '/30'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`p-2 rounded-xl transition-all ${
                                            isActive
                                                ? 'bg-white/20'
                                                : 'bg-gray-100 group-hover:bg-gray-200'
                                        }`}>
                                            <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                                        </div>
                                        <span className="flex-1 font-semibold">{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Tip Card */}
                    <div className="p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-5 border border-blue-100"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full blur-3xl opacity-20"></div>
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-white/80 rounded-xl shadow-sm">
                                        <Sparkles className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-900">
                                        💡 Dica do dia
                                    </p>
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed">
                                    Organize suas despesas por categoria para um melhor controle financeiro e tome decisões mais inteligentes.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </aside>

            {/* Sidebar Mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sidebarVariants}
                        className="fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-100 z-50 lg:hidden shadow-2xl"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header - Mobile only */}
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Menu
                                </h2>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                                    aria-label="Close menu"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                                {navigationItems.map((item, index) => (
                                    <motion.div
                                        key={item.path}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <NavLink
                                            to={item.path}
                                            onClick={() => onClose?.()}
                                            className={({ isActive }) =>
                                                `group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                                                    isActive
                                                        ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <div className={`p-2 rounded-xl transition-all ${
                                                        isActive
                                                            ? 'bg-white/20'
                                                            : 'bg-gray-100 group-hover:bg-gray-200'
                                                    }`}>
                                                        <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                                                    </div>
                                                    <span className="flex-1 font-semibold">{item.name}</span>
                                                </>
                                            )}
                                        </NavLink>
                                    </motion.div>
                                ))}
                            </nav>

                            {/* Tip Card */}
                            <div className="p-4">
                                <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full blur-3xl opacity-20"></div>
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-2 bg-white/80 rounded-xl shadow-sm">
                                                <Sparkles className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <p className="text-xs font-bold text-gray-900">
                                                💡 Dica do dia
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-700 leading-relaxed">
                                            Organize suas despesas por categoria para um melhor controle financeiro e tome decisões mais inteligentes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
};