// src/components/common/Footer.tsx
import { Github, Mail, Twitter, Linkedin, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        produto: [
            { name: 'Recursos', href: '#features' },
            { name: 'Preços', href: '#pricing' },
            { name: 'Atualizações', href: '#updates' },
            { name: 'Demonstração', href: '/login' },
        ],
        empresa: [
            { name: 'Sobre Nós', href: '#about' },
            { name: 'Blog', href: '#blog' },
            { name: 'Carreiras', href: '#careers' },
            { name: 'Contato', href: '#contact' },
        ],
        suporte: [
            { name: 'Central de Ajuda', href: '/help' },
            { name: 'Documentação', href: '#docs' },
            { name: 'Status', href: '#status' },
            { name: 'API', href: '#api' },
        ],
        legal: [
            { name: 'Privacidade', href: '/privacy' },
            { name: 'Termos de Uso', href: '/terms' },
            { name: 'Cookies', href: '/cookies' },
            { name: 'Licenças', href: '/licenses' },
        ],
    };

    const socialLinks = [
        { icon: Github, href: 'https://github.com', label: 'GitHub' },
        { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
        { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
        { icon: Mail, href: 'mailto:contato@financeiro.com', label: 'Email' },
    ];

    return (
        <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="py-12 grid grid-cols-2 md:grid-cols-6 gap-8">
                    {/* Brand Column */}
                    <div className="col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl blur opacity-50"></div>
                                <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                                    <DollarSign className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                FinanceiroApp
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 max-w-xs leading-relaxed">
                            Gerencie suas finanças com inteligência e alcance seus objetivos financeiros.
                        </p>
                        <div className="flex items-center gap-2">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Produto</h3>
                        <ul className="space-y-3">
                            {footerLinks.produto.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Empresa</h3>
                        <ul className="space-y-3">
                            {footerLinks.empresa.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Suporte</h3>
                        <ul className="space-y-3">
                            {footerLinks.suporte.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-6 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>© {currentYear} FinanceiroApp</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">v1.0.0</span>
                        </div>

                        <div className="text-sm text-gray-600">
                            <span>Todos os direitos reservados</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};