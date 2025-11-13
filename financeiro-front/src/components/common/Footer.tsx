// src/components/common/Footer.tsx

import { Heart, Github, Mail } from 'lucide-react';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Left: Copyright */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>© {currentYear} Financeiro Pessoal</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">v1.0.0</span>
                    </div>

                    {/* Center: Made with love */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <span>Feito com</span>
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                        <span>para gerenciar suas finanças</span>
                    </div>

                    {/* Right: Links */}
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            aria-label="GitHub"
                        >
                            <Github className="h-5 w-5" />
                        </a>
                        <a
                            href="mailto:contato@financeiro.com"
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            aria-label="Email"
                        >
                            <Mail className="h-5 w-5" />
                        </a>
                    </div>
                </div>

                {/* Bottom: Additional Links */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                        <a href="/privacy" className="hover:text-gray-900 transition-colors">
                            Política de Privacidade
                        </a>
                        <span>•</span>
                        <a href="/terms" className="hover:text-gray-900 transition-colors">
                            Termos de Uso
                        </a>
                        <span>•</span>
                        <a href="/help" className="hover:text-gray-900 transition-colors">
                            Central de Ajuda
                        </a>
                        <span>•</span>
                        <a href="/contact" className="hover:text-gray-900 transition-colors">
                            Contato
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};