// src/pages/LandingPage.tsx
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    PiggyBank,
    Target,
    BarChart3,
    Shield,
    Zap,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import {Footer} from "../common/Footer.tsx";

export const LandingPage = () => {
    const features = [
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Dashboard Intuitivo",
            description: "Visualize suas finanças com gráficos e relatórios detalhados em tempo real."
        },
        {
            icon: <PiggyBank className="w-6 h-6" />,
            title: "Controle de Despesas",
            description: "Organize e categorize seus gastos para entender melhor seus hábitos."
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: "Metas Financeiras",
            description: "Defina e acompanhe suas metas de economia e investimento."
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: "Análise de Receitas",
            description: "Monitore todas as suas fontes de renda de forma simples."
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Segurança Total",
            description: "Seus dados protegidos com criptografia de ponta a ponta."
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Rápido e Eficiente",
            description: "Interface leve e responsiva para uso em qualquer dispositivo."
        }
    ];

    const benefits = [
        "Controle total das suas finanças pessoais",
        "Relatórios detalhados e personalizáveis",
        "Categorias customizáveis",
        "Notificações de gastos importantes",
        "Suporte multiplataforma",
        "Sincronização em tempo real"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-8 h-8 text-primary-600" />
                            <span className="text-xl font-bold text-gray-900">FinanceiroApp</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                            >
                                Entrar
                            </Link>
                            <Link
                                to="/register"
                                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md hover:shadow-lg"
                            >
                                Criar Conta
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Gerencie Suas Finanças
                            <span className="text-primary-600"> com Inteligência</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            A solução completa para organizar receitas, despesas e alcançar suas metas financeiras de forma simples e eficiente.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/register"
                                className="bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl text-lg flex items-center justify-center gap-2 group"
                            >
                                Começar Gratuitamente
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/login"
                                className="bg-white text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold shadow-md hover:shadow-lg text-lg border border-gray-200"
                            >
                                Ver Demonstração
                            </Link>
                        </div>
                    </div>

                    {/* Hero Image/Card */}
                    <div className="mt-16 max-w-5xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                    <div className="text-3xl font-bold text-green-600 mb-2">R$ 12.450</div>
                                    <div className="text-gray-600">Receitas do Mês</div>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                                    <div className="text-3xl font-bold text-red-600 mb-2">R$ 8.230</div>
                                    <div className="text-gray-600">Despesas do Mês</div>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
                                    <div className="text-3xl font-bold text-primary-600 mb-2">R$ 4.220</div>
                                    <div className="text-gray-600">Saldo Atual</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Recursos Poderosos
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Tudo que você precisa para ter controle total sobre suas finanças pessoais.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-primary-300 group"
                            >
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">
                                Por Que Escolher o FinanceiroApp?
                            </h2>
                            <p className="text-xl text-primary-100">
                                Junte-se a milhares de usuários que já transformaram sua vida financeira.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-lg"
                                >
                                    <CheckCircle2 className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                                    <span className="text-lg">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <Link
                                to="/register"
                                className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg hover:shadow-xl text-lg"
                            >
                                Criar Minha Conta Grátis
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl font-bold mb-6">
                            Pronto Para Transformar Suas Finanças?
                        </h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Comece gratuitamente hoje e tenha controle total do seu dinheiro em minutos.
                        </p>
                        <Link
                            to="/register"
                            className="inline-block bg-primary-600 text-white px-10 py-5 rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl text-lg"
                        >
                            Criar Conta Gratuita
                        </Link>
                        <p className="text-gray-400 mt-4 text-sm">
                            Sem cartão de crédito necessário • Configuração em 2 minutos
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};
