import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {TrendingUp, PiggyBank, Target, BarChart3, Shield, Zap, CheckCircle2, ArrowRight, Sparkles, DollarSign, ChevronDown, Play, TrendingDown, Wallet, ChevronRight, Activity, Eye, EyeOff
} from 'lucide-react';
import {Footer} from "../common/Footer.tsx";
import {NavbarLp} from "./NavbarLp.tsx";

export default function LandingPage() {
    const [, setActiveFeature] = useState(0);

    const [faqOpen, setFaqOpen] = useState<number | null>(null);

    const [showDashboard, setShowDashboard] = useState(false);
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    // Mock data para Dashboard Preview
    const mockDashboardData = {
        receitas: 12450,
        despesas: 8230,
        saldo: 4220,
        metas: 65,
        categories: [
            { name: 'Alimentação', value: 2500, color: '#ef4444', percent: 30 },
            { name: 'Transporte', value: 1800, color: '#f97316', percent: 22 },
            { name: 'Moradia', value: 2200, color: '#f59e0b', percent: 27 },
            { name: 'Lazer', value: 1730, color: '#84cc16', percent: 21 }
        ],
        evolution: [
            { month: 'Jul', receitas: 11200, despesas: 7800 },
            { month: 'Ago', receitas: 11800, despesas: 8100 },
            { month: 'Set', receitas: 12450, despesas: 8230 }
        ]
    };

    const features = [
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Dashboard Intuitivo",
            description: "Visualize suas finanças com gráficos e relatórios detalhados em tempo real.",
            gradient: "from-blue-500 to-cyan-500",
            stat: "95% mais rápido"
        },
        {
            icon: <PiggyBank className="w-6 h-6" />,
            title: "Controle de Despesas",
            description: "Organize e categorize seus gastos para entender melhor seus hábitos.",
            gradient: "from-purple-500 to-pink-500",
            stat: "Economia média de 30%"
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: "Metas Financeiras",
            description: "Defina e acompanhe suas metas de economia e investimento.",
            gradient: "from-orange-500 to-red-500",
            stat: "85% atingem metas"
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: "Análise de Receitas",
            description: "Monitore todas as suas fontes de renda de forma simples.",
            gradient: "from-green-500 to-emerald-500",
            stat: "+45% produtividade"
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Segurança Total",
            description: "Seus dados protegidos com criptografia de ponta a ponta.",
            gradient: "from-indigo-500 to-purple-500",
            stat: "100% seguro"
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Rápido e Eficiente",
            description: "Interface leve e responsiva para uso em qualquer dispositivo.",
            gradient: "from-yellow-500 to-orange-500",
            stat: "Carrega em 0.5s"
        }
    ];

    const faqs = [
        {
            question: "Como funciona o período gratuito?",
            answer: "Você pode usar todas as funcionalidades sem limitações por tempo indeterminado. Não pedimos cartão de crédito."
        },
        {
            question: "Meus dados estão seguros?",
            answer: "Sim! Utilizamos criptografia de ponta a ponta e não compartilhamos suas informações com terceiros."
        },
        {
            question: "Posso usar em múltiplos dispositivos?",
            answer: "Absolutamente! Seu acesso é sincronizado automaticamente em todos os seus dispositivos."
        },
        {
            question: "Tem suporte para categorias customizadas?",
            answer: "Sim! Você pode criar quantas categorias personalizadas quiser para organizar suas finanças do seu jeito."
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            // This call is now valid because setActiveFeature is the setter function
            setActiveFeature((prev) => (prev + 1) % features.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [features.length, setActiveFeature]); // Added dependencies to useEffect hook

    const formatCurrency = (value: number | bigint) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Navbar */}
            <NavbarLp />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

                <div className="container mx-auto relative">
                    <motion.div
                        style={{ opacity, scale }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-8 border border-blue-100 hover:shadow-lg transition-all cursor-pointer"
                        >
                            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                            <span className="text-sm font-medium text-gray-700">Controle financeiro inteligente</span>
                            <ChevronRight className="w-4 h-4 text-blue-600" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-5xl sm:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
                        >
                            Gerencie suas
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent inline-block">
                                finanças com clareza
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto"
                        >
                            A solução completa para organizar receitas, despesas e alcançar suas metas financeiras de forma simples e eficiente.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                        >
                            <button className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 text-lg">
                                Começar Gratuitamente
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => {
                                    setShowDashboard(!showDashboard);
                                    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-md hover:shadow-lg text-lg border border-gray-200 group"
                            >
                                {showDashboard ? <EyeOff className="w-5 h-5 text-blue-600" /> : <Eye className="w-5 h-5 text-blue-600" />}
                                {showDashboard ? 'Ocultar' : 'Ver'} Demonstração
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex items-center justify-center gap-6 text-sm text-gray-600 flex-wrap"
                        >
                            <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Grátis para começar</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Sem cartão de crédito</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Cancele quando quiser</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Quick Stats Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 1 }}
                        className="mt-20 max-w-6xl mx-auto"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-indigo-600 rounded-3xl blur-2xl opacity-20"></div>
                            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { value: "R$ 12.450", label: "Receitas do Mês", icon: <TrendingUp className="w-6 h-6" />, color: "from-emerald-500 to-green-500", bg: "from-emerald-50 to-green-50" },
                                        { value: "R$ 8.230", label: "Despesas do Mês", icon: <TrendingDown className="w-6 h-6" />, color: "from-red-500 to-rose-500", bg: "from-red-50 to-rose-50" },
                                        { value: "R$ 4.220", label: "Saldo Atual", icon: <Wallet className="w-6 h-6" />, color: "from-blue-500 to-indigo-500", bg: "from-blue-50 to-indigo-50" }
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            className={`relative group text-center p-6 bg-gradient-to-br ${item.bg} rounded-2xl border border-gray-100 cursor-pointer overflow-hidden`}
                                        >
                                            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${item.color} rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity`}></div>
                                            <div className={`inline-flex p-3 bg-gradient-to-br ${item.color} rounded-xl mb-3 text-white shadow-lg`}>
                                                {item.icon}
                                            </div>
                                            <div className={`text-4xl font-bold bg-gradient-to-br ${item.color} bg-clip-text text-transparent mb-2`}>
                                                {item.value}
                                            </div>
                                            <div className="text-gray-600 font-medium">{item.label}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="flex flex-col items-center gap-2 text-gray-400 cursor-pointer"
                    >
                        <span className="text-sm">Role para explorar</span>
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Dashboard Preview Section */}
            <section id="demo" className="py-24 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Veja o Dashboard em Ação
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Interface moderna e intuitiva para controlar suas finanças
                        </p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {showDashboard && (
                            <motion.div
                                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                                transition={{ duration: 0.5 }}
                                className="max-w-7xl mx-auto"
                            >
                                {/* Dashboard Mock */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-2xl p-8 border border-gray-200">
                                    {/* Dashboard Header */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">Dashboard</h3>
                                            <p className="text-gray-600">Visão geral das suas finanças</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-4 py-2">
                                            <span className="text-sm font-medium text-gray-700">Novembro 2025</span>
                                        </div>
                                    </div>

                                    {/* Cards Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                        {[
                                            { title: 'Receitas do Mês', value: mockDashboardData.receitas, icon: TrendingUp, color: 'green' },
                                            { title: 'Despesas do Mês', value: mockDashboardData.despesas, icon: TrendingDown, color: 'red' },
                                            { title: 'Saldo Atual', value: mockDashboardData.saldo, icon: DollarSign, color: 'blue' },
                                            { title: 'Progresso Metas', value: mockDashboardData.metas, icon: Target, color: 'purple', isPercent: true }
                                        ].map((card, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
                                            >
                                                <div className={`inline-flex p-3 bg-${card.color}-100 rounded-lg mb-4`}>
                                                    <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                                                </div>
                                                <h4 className="text-sm text-gray-600 mb-2">{card.title}</h4>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {card.isPercent ? `${card.value}%` : formatCurrency(card.value)}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Charts Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Pie Chart Mock */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="bg-white rounded-xl p-6 shadow-sm"
                                        >
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="p-2 bg-red-100 rounded-lg">
                                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">Despesas por Categoria</h4>
                                                    <p className="text-sm text-gray-600">Total: {formatCurrency(mockDashboardData.despesas)}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                {mockDashboardData.categories.map((cat, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex justify-between mb-1">
                                                                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                                                                <span className="text-sm text-gray-600">{cat.percent}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${cat.percent}%` }}
                                                                    transition={{ duration: 1, delay: i * 0.1 + 0.5 }}
                                                                    className="h-2 rounded-full"
                                                                    style={{ backgroundColor: cat.color }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-900 min-w-[80px] text-right">
                                                            {formatCurrency(cat.value)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>

                                        {/* Line Chart Mock */}
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="bg-white rounded-xl p-6 shadow-sm"
                                        >
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="p-2 bg-indigo-100 rounded-lg">
                                                    <Activity className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">Evolução Mensal</h4>
                                                    <p className="text-sm text-gray-600">Últimos 3 meses</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {mockDashboardData.evolution.map((month, i) => (
                                                    <div key={i} className="space-y-2">
                                                        <div className="text-sm font-medium text-gray-700">{month.month}</div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="bg-green-50 rounded-lg p-3">
                                                                <div className="text-xs text-gray-600">Receitas</div>
                                                                <div className="text-sm font-bold text-green-600">
                                                                    {formatCurrency(month.receitas)}
                                                                </div>
                                                            </div>
                                                            <div className="bg-red-50 rounded-lg p-3">
                                                                <div className="text-xs text-gray-600">Despesas</div>
                                                                <div className="text-sm font-bold text-red-600">
                                                                    {formatCurrency(month.despesas)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!showDashboard && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                        >
                            <button
                                onClick={() => setShowDashboard(true)}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg shadow-blue-500/30"
                            >
                                <Play className="w-5 h-5" />
                                Ver Dashboard Interativo
                            </button>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Recursos Poderosos
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Tudo que você precisa para ter controle total sobre suas finanças pessoais.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -12, transition: { duration: 0.3 } }}
                                className="group relative bg-white p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${feature.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                                <div className="relative">
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                        className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:shadow-2xl transition-shadow`}
                                    >
                                        {feature.icon}
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed mb-4">
                                        {feature.description}
                                    </p>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${feature.gradient} bg-opacity-10 rounded-full`}>
                                        <span className={`text-sm font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                                            {feature.stat}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                                Por Que Escolher o FinanceiroApp?
                            </h2>
                            <p className="text-xl text-blue-100">
                                Junte-se a milhares de usuários que já transformaram sua vida financeira.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                "Controle total das suas finanças pessoais",
                                "Relatórios detalhados e personalizáveis",
                                "Categorias customizáveis",
                                "Notificações de gastos importantes",
                                "Suporte multiplataforma",
                                "Sincronização em tempo real"
                            ].map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 hover:bg-white/15 transition-all"
                                >
                                    <CheckCircle2 className="w-6 h-6 text-green-300 flex-shrink-0" />
                                    <span className="text-lg">{benefit}</span>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-12 text-center"
                        >
                            <button className="inline-block bg-white text-blue-600 px-10 py-4 rounded-xl hover:bg-gray-50 transition-all font-bold shadow-2xl hover:shadow-3xl text-lg">
                                Criar Minha Conta Grátis
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Perguntas Frequentes
                        </h2>
                        <p className="text-xl text-gray-600">
                            Tudo que você precisa saber sobre o FinanceiroApp.
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <button
                                    // This onClick is now valid because setFaqOpen accepts `number | null`
                                    onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
                                    <motion.div
                                        animate={{ rotate: faqOpen === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {faqOpen === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-5 text-gray-600">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                            Pronto Para Transformar Suas Finanças?
                        </h2>
                        <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                            Comece gratuitamente hoje e tenha controle total do seu dinheiro em minutos.
                        </p>
                        <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold shadow-2xl shadow-blue-500/30 hover:shadow-3xl text-lg group">
                            Criar Conta Gratuita
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-gray-400 mt-6 text-sm">
                            Sem cartão de crédito necessário • Configuração em 2 minutos
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
             <Footer />
        </div>
    );
}