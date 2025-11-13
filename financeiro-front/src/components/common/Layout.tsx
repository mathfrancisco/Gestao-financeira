// src/components/common/Layout.tsx

import { useState, type ReactNode } from 'react';

import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import {Header} from "./Header.tsx";

interface LayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    showFooter?: boolean;
}

export const Layout = ({
                           children,
                           showSidebar = true,
                           showFooter = true
                       }: LayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <Header
                onMenuToggle={toggleSidebar}
                showMenuButton={showSidebar}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                {showSidebar && (
                    <Sidebar
                        isOpen={isSidebarOpen}
                        onClose={closeSidebar}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Footer */}
            {showFooter && <Footer />}
        </div>
    );
};