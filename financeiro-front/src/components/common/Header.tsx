import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
    User,
    Settings,
    LogOut,
    Menu as MenuIcon,
    DollarSign,
    ChevronDown,
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
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Logo + Menu Button */}
                    <div className="flex items-center gap-4">
                        {showMenuButton && (
                            <button
                                onClick={onMenuToggle}
                                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                aria-label="Toggle menu"
                            >
                                <MenuIcon className="h-6 w-6" />
                            </button>
                        )}

                        <Link to="/dashboard" className="flex items-center gap-2">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                                <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-bold text-gray-900">
                                    Financeiro
                                </h1>
                                <p className="text-xs text-gray-500">Controle Pessoal</p>
                            </div>
                        </Link>
                    </div>

                    {/* Right: User Menu */}
                    <div className="flex items-center gap-4">
                        {/* User Info - Hidden on mobile */}
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>

                        {/* User Dropdown */}
                        <Menu as="div" className="relative">
                            <Menu.Button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                {user?.fotoUrl ? (
                                    <img
                                        src={user.fotoUrl}
                                        alt={user.nome}
                                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-gray-200">
                                        {userInitials}
                                    </div>
                                )}
                                <ChevronDown className="h-4 w-4 text-gray-600 hidden sm:block" />
                            </Menu.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
                                    {/* User Info Section - Mobile only */}
                                    <div className="px-4 py-3 md:hidden">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {user?.nome}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                      {user?.tipoUsuario === 'ADMIN' ? 'Administrador' : 'Usuário'}
                    </span>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/profile"
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors`}
                                                >
                                                    <User className="h-4 w-4" />
                                                    Meu Perfil
                                                </Link>
                                            )}
                                        </Menu.Item>

                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/settings"
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors`}
                                                >
                                                    <Settings className="h-4 w-4" />
                                                    Configurações
                                                </Link>
                                            )}
                                        </Menu.Item>
                                    </div>

                                    {/* Logout */}
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={logout}
                                                    className={`${
                                                        active ? 'bg-red-50' : ''
                                                    } flex items-center gap-3 px-4 py-2 text-sm text-red-600 w-full text-left transition-colors`}
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Sair
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