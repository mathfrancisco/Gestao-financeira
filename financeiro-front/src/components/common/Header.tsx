// src/components/common/Header.tsx
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
    User,
    Settings,
    LogOut,
    Menu as MenuIcon,
    DollarSign,
    ChevronDown,
    Bell,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
    onMenuToggle?: () => void;
    showMenuButton?: boolean;
}

export const Header = ({ onMenuToggle, showMenuButton = true }: HeaderProps) => {
    const { user, logout } = useAuth();

    const userInitials = user?.nome
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Menu Button + Logo */}
                    <div className="flex items-center gap-4">
                        {showMenuButton && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onMenuToggle}
                                className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                                aria-label="Toggle menu"
                            >
                                <MenuIcon className="h-5 w-5" />
                            </motion.button>
                        )}

                        <Link to="/dashboard" className="flex items-center gap-3">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                                    <DollarSign className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Financeiro
                                </h1>
                                <p className="text-[10px] text-gray-500 -mt-0.5">Controle Pessoal</p>
                            </div>
                        </Link>
                    </div>

                    {/* Right: Notifications + User Menu */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </motion.button>

                        {/* User Info - Hidden on mobile */}
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-semibold text-gray-900">{user?.nome}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>

                        {/* User Dropdown */}
                        <Menu as="div" className="relative">
                            <Menu.Button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-all">
                                {user?.fotoUrl ? (
                                    <img
                                        src={user.fotoUrl}
                                        alt={user.nome}
                                        className="h-10 w-10 rounded-xl object-cover border-2 border-gray-100"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm border-2 border-gray-100 shadow-lg">
                                        {userInitials}
                                    </div>
                                )}
                                <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                            </Menu.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-200"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-150"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 mt-3 w-64 origin-top-right bg-white rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 border border-gray-100">
                                    {/* User Info Section - Mobile only */}
                                    <div className="px-4 py-4 md:hidden">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                {userInitials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {user?.nome}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
                                            {user?.tipoUsuario === 'ADMIN' ? 'Administrador' : 'Usuário'}
                                        </span>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/profile"
                                                    className={`${
                                                        active ? 'bg-gray-50' : ''
                                                    } flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors rounded-xl mx-2`}
                                                >
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <User className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">Meu Perfil</p>
                                                        <p className="text-xs text-gray-500">Gerenciar informações</p>
                                                    </div>
                                                </Link>
                                            )}
                                        </Menu.Item>

                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/settings"
                                                    className={`${
                                                        active ? 'bg-gray-50' : ''
                                                    } flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors rounded-xl mx-2`}
                                                >
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <Settings className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">Configurações</p>
                                                        <p className="text-xs text-gray-500">Preferências do sistema</p>
                                                    </div>
                                                </Link>
                                            )}
                                        </Menu.Item>
                                    </div>

                                    {/* Logout */}
                                    <div className="py-2">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={logout}
                                                    className={`${
                                                        active ? 'bg-red-50' : ''
                                                    } flex items-center gap-3 px-4 py-3 text-sm text-red-600 w-full text-left transition-colors rounded-xl mx-2`}
                                                >
                                                    <div className="p-2 bg-red-50 rounded-lg">
                                                        <LogOut className="h-4 w-4 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">Sair da conta</p>
                                                        <p className="text-xs text-red-500">Desconectar do sistema</p>
                                                    </div>
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>
            </div>
        </header>
    );
};