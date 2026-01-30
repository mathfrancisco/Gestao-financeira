# 💰 Sistema de Gestão Financeira Pessoal

[![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2+-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Sistema web fullstack completo para gestão financeira pessoal com IA integrada, oferecendo controle inteligente de receitas, despesas, metas financeiras, análises preditivas e insights automatizados.

## 🎯 Principais Funcionalidades

### Core Features
- 🔐 **Autenticação Multi-usuário** - JWT com refresh tokens e sessões seguras
- 💰 **Gestão de Receitas** - Controle de salários, auxílios e rendas extras
- 💸 **Controle de Despesas** - Categorização, parcelamento e rastreamento
- 🎯 **Metas Financeiras** - Objetivos, prazos e acompanhamento de progresso
- 📊 **Dashboard Analítico** - Visualizações em tempo real com cache inteligente
- 🏷️ **Categorias Personalizadas** - Sistema flexível de organização
- 📱 **Design Responsivo** - Mobile-first, PWA-ready

### Recursos Avançados
- 🤖 **Assistente Financeiro IA** - Análise de padrões e recomendações personalizadas
- 📈 **Previsões Inteligentes** - Machine Learning para projeções de gastos
- 🔔 **Alertas Proativos** - Notificações automáticas de anomalias e oportunidades
- 📄 **Geração de Relatórios** - Exportação PDF/Excel com insights
- 🔄 **Importação Bancária** - OCR e parsing de extratos (OFX, CSV)
- 💡 **Insights Automáticos** - Detecção de padrões e sugestões de economia

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│   Vercel CDN • PWA • Offline-First • Real-time Updates  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS/REST + WebSocket
                        │ JWT Authentication
┌───────────────────────▼─────────────────────────────────┐
│                  BACKEND (Spring Boot)                   │
│  Microservices Ready • Event-Driven • CQRS Pattern      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Core API   │  │   AI Engine  │  │  Scheduler   │  │
│  │   Service    │  │   Service    │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                           │                              │
└───────────────────────────┼──────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼────────┐                    ┌────────▼─────────┐
│   PostgreSQL   │                    │   Redis Cache    │
│  Primary + HA  │                    │  Session + Queue │
└────────────────┘                    └──────────────────┘
```

**Stack Tecnológica:**
- **Backend:** Java 17, Spring Boot 3.2, Spring Security, JPA/Hibernate
- **Frontend:** React 18, Vite, TailwindCSS, React Query, Zustand
- **Banco de Dados:** PostgreSQL 16 (Primary), Redis (Cache/Queue)
- **IA/ML:** Python (FastAPI), TensorFlow, Scikit-learn, Pandas
- **Infraestrutura:** Docker, Railway.app, Vercel, GitHub Actions

## 🚀 Quick Start

### Pré-requisitos
```bash
- Docker & Docker Compose
- Java 17+
- Node.js 20+
- Python 3.11+ (para módulo IA)
```

### Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/financeiro-pessoal.git
cd financeiro-pessoal

# Configure variáveis de ambiente
cp .env.example .env

# Inicie todos os serviços
docker-compose up -d

# Acesse a aplicação
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html
# AI API: http://localhost:8000/docs
```

### Desenvolvimento Local

**Backend:**
```bash
cd backend
mvn clean install
mvn spring-boot:run -Dspring.profiles.active=dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**AI Service:**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 📚 Documentação Completa

A documentação técnica detalhada está organizada em módulos:

| Documento | Descrição |
|-----------|-----------|
| [Arquitetura](docs/Arquitetura.md) | Visão geral da arquitetura, padrões e decisões técnicas |
| [Database](docs/Database.md) | Modelo de dados, relacionamentos e otimizações |
| [API](docs/API.md) | Referência completa de endpoints REST |
| [Regras de Negócio](docs/RegrasDeNegocio.md) | Lógica de negócio, validações e casos de uso |
| [IA & Machine Learning](docs/IA.md) | Modelos, algoritmos e integração IA |
| [Segurança](docs/Seguranca.md) | Autenticação, autorização e práticas de segurança |
| [Deploy](docs/Deploy.md) | Guia de deployment e CI/CD |
| [Testes](docs/Testes.md) | Estratégia de testes e cobertura |

### Diagramas
- [Arquitetura do Sistema](docs/diagramas/Arquitetura.mermaid)
- [Casos de Uso](docs/diagramas/CasosDeUso.mermaid)
- [Modelo de Dados](docs/diagramas/Database.mermaid)
- [Fluxo de Dados](docs/diagramas/FluxoDeDados.mermaid)
- [Componentes IA](docs/diagramas/ComponentesIA.mermaid)

## 🔒 Segurança

- ✅ Autenticação JWT com refresh tokens
- ✅ Senha criptografada com Argon2
- ✅ HTTPS obrigatório em produção
- ✅ Rate limiting por IP e usuário
- ✅ Proteção CSRF, XSS, SQL Injection
- ✅ CORS configurado com whitelist
- ✅ Auditoria completa de operações
- ✅ LGPD/GDPR compliance

## 📊 Performance

- ⚡ Cache inteligente multi-camadas (Caffeine + Redis)
- ⚡ Lazy loading e paginação otimizada
- ⚡ Índices de banco otimizados
- ⚡ CDN global para assets estáticos
- ⚡ Compressão Gzip/Brotli
- ⚡ Code splitting e tree shaking
- ⚡ Query optimization com projections

## 🌟 Roadmap

### Fase 1 - MVP ✅ (Atual)
- [x] CRUD completo de transações
- [x] Sistema de autenticação
- [x] Dashboard básico
- [x] Categorização

### Fase 2 - IA Básica 🚧 (Em Desenvolvimento)
- [x] Análise de padrões de gastos
- [x] Previsão de despesas mensais
- [x] Detecção de anomalias
- [ ] Categorização automática
- [ ] Sugestões de economia

### Fase 3 - Recursos Avançados 📋 (Planejado)
- [ ] Integração bancária (Open Finance)
- [ ] Assistente conversacional
- [ ] Investimentos e carteiras
- [ ] Metas inteligentes adaptativas
- [ ] Comparação com mercado
- [ ] Gamificação

### Fase 4 - Enterprise 🔮 (Futuro)
- [ ] Multi-tenancy
- [ ] App mobile nativo
- [ ] Relatórios avançados
- [ ] Planejamento fiscal
- [ ] Gestão familiar compartilhada

## 💻 Tecnologias Utilizadas

### Backend
- **Framework:** Spring Boot 3.2, Spring Security 6, Spring Data JPA
- **Banco:** PostgreSQL 16, Redis 7
- **Cache:** Caffeine, Redis
- **Documentação:** SpringDoc OpenAPI 3
- **Testes:** JUnit 5, Mockito, TestContainers
- **Build:** Maven 3.9

### Frontend
- **Core:** React 18, Vite 5, React Router 6
- **UI:** TailwindCSS 3, HeadlessUI, Framer Motion
- **Estado:** Zustand 4, TanStack Query 5
- **Forms:** React Hook Form 7, Zod 3
- **Gráficos:** Recharts 2, D3.js
- **Testes:** Vitest, Testing Library, Playwright

### IA/ML
- **Framework:** FastAPI, TensorFlow 2.14, Scikit-learn
- **Processamento:** Pandas, NumPy, SciPy
- **NLP:** spaCy, Transformers (BERT)
- **Visualização:** Matplotlib, Seaborn

### DevOps
- **Containers:** Docker 24, Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoramento:** Prometheus, Grafana
- **Logs:** ELK Stack (Elasticsearch, Logstash, Kibana)

## 📈 Métricas e Monitoramento

- **Uptime:** 99.9% SLA
- **Response Time:** < 200ms (p95)
- **Cache Hit Rate:** > 85%
- **Test Coverage:** > 80%
- **Lighthouse Score:** > 90

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes detalhadas.

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.


