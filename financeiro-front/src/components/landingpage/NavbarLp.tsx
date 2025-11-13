import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

export const NavbarLp = () => {
    const navigate = useNavigate();

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
        >
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                    >
                        <DollarSign className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">FinanceiroApp</span>
                    </button>

                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Começar Grátis
                        </button>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};
