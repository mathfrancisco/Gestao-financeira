# Sistema de Gestão Financeira Pessoal

## 📋 Visão Geral

Sistema web fullstack para gerenciamento financeiro pessoal com controle de receitas, despesas, metas financeiras, dashboard analítico e autenticação multi-usuário.[1][2][3]

## Principais Funcionalidades

✅ Autenticação JWT com multi-usuário
💰 Controle de receitas e despesas
🎯 Gerenciamento de metas financeiras
📊 Dashboard com análises e gráficos
🏷️ Categorização customizável
📱 Interface responsiva
⚡ Cache com Caffeine
🔒 Segurança robusta[4][1]

## 🏗️ Arquitetura do Sistema

### Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  React 18 + Vite + TailwindCSS + React Query + Zustand     │
│  (Deploy: Vercel - CDN Global)                              │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/REST API
                     │ JWT Token
┌────────────────────▼────────────────────────────────────────┐
│                      BACKEND API                             │
│  Spring Boot 3.2+ + Spring Security + JWT                   │
│  Arquitetura em Camadas (Controller/Service/Repository)     │
│  Cache: Caffeine (Local em Memória)                         │
│  (Deploy: Railway.app - Container Docker)                   │
└──────┬──────────────────────────────────────────────────────┘
       │ JPA/Hibernate
       │
┌──────▼──────────────────────┐
│     POSTGRESQL 16           │
│  Banco de Dados Principal   │
│  (Deploy: Railway - Docker) │
└─────────────────────────────┘
```

### Padrões Arquiteturais

**Frontend**: Component-based architecture com hooks e context
**Backend**: Arquitetura em camadas (Controller → Service → Repository)
**API**: RESTful com versionamento
**Autenticação**: JWT stateless
**Cache**: Estratégia local com Caffeine
**Banco de Dados**: Normalizado com índices otimizados

## 📂 Estrutura Completa do Projeto

```
financeiro-pessoal/
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── README.md
├── .gitignore
├── .env.example
│
├── docs/
│   ├── diagramas/
│   │   ├── diagrama-autenticacao.md
│   │   ├── diagrama-despesas.md
│   │   ├── diagrama-dashboard.md
│   │   ├── diagrama-paginacao.md
│   │   ├── diagrama-seguranca.md
│   │   └── diagrama-ciclo-vida.md
│   ├── API.md
│   └── DEPLOY.md
│
├── scripts/
│   ├── backup-db.sh
│   ├── restore-db.sh
│   └── deploy.sh
│
├── backend/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/financeiro/
│       │   │   ├── FinanceiroPessoalApplication.java
│       │   │   ├── config/
│       │   │   │   ├── CorsConfig.java
│       │   │   │   ├── SecurityConfig.java
│       │   │   │   ├── DatabaseConfig.java
│       │   │   │   ├── CacheConfig.java
│       │   │   │   ├── JwtConfig.java
│       │   │   │   └── OpenApiConfig.java
│       │   │   ├── security/
│       │   │   │   ├── JwtTokenProvider.java
│       │   │   │   ├── JwtAuthenticationFilter.java
│       │   │   │   ├── UserDetailsServiceImpl.java
│       │   │   │   └── AuthenticationService.java
│       │   │   ├── controller/
│       │   │   │   ├── AuthController.java
│       │   │   │   ├── UsuarioController.java
│       │   │   │   ├── ReceitaController.java
│       │   │   │   ├── DespesaController.java
│       │   │   │   ├── MetaController.java
│       │   │   │   ├── ParametroController.java
│       │   │   │   ├── CategoriaController.java
│       │   │   │   └── DashboardController.java
│       │   │   ├── service/
│       │   │   │   ├── UsuarioService.java
│       │   │   │   ├── ReceitaService.java
│       │   │   │   ├── DespesaService.java
│       │   │   │   ├── MetaService.java
│       │   │   │   ├── ParametroService.java
│       │   │   │   ├── CategoriaService.java
│       │   │   │   ├── TransacaoMetaService.java
│       │   │   │   ├── DashboardService.java
│       │   │   │   └── CacheService.java
│       │   │   ├── repository/
│       │   │   │   ├── UsuarioRepository.java
│       │   │   │   ├── ReceitaRepository.java
│       │   │   │   ├── DespesaRepository.java
│       │   │   │   ├── MetaRepository.java
│       │   │   │   ├── ParametroRepository.java
│       │   │   │   ├── CategoriaRepository.java
│       │   │   │   └── TransacaoMetaRepository.java
│       │   │   ├── projection/
│       │   │   │   ├── DespesaResumoProjection.java
│       │   │   │   ├── ReceitaResumoProjection.java
│       │   │   │   ├── MetaResumoProjection.java
│       │   │   │   └── DashboardProjection.java
│       │   │   ├── model/
│       │   │   │   ├── Usuario.java
│       │   │   │   ├── Receita.java
│       │   │   │   ├── Despesa.java
│       │   │   │   ├── Meta.java
│       │   │   │   ├── Parametro.java
│       │   │   │   ├── Categoria.java
│       │   │   │   ├── TransacaoMeta.java
│       │   │   │   ├── BaseEntity.java
│       │   │   │   └── enums/
│       │   │   │       ├── StatusPagamento.java
│       │   │   │       ├── CategoriaDespesa.java
│       │   │   │       ├── TipoMeta.java
│       │   │   │       ├── StatusMeta.java
│       │   │   │       └── TipoUsuario.java
│       │   │   ├── dto/
│       │   │   │   ├── request/
│       │   │   │   │   ├── LoginRequestDTO.java
│       │   │   │   │   ├── RegisterRequestDTO.java
│       │   │   │   │   ├── ReceitaRequestDTO.java
│       │   │   │   │   ├── DespesaRequestDTO.java
│       │   │   │   │   ├── MetaRequestDTO.java
│       │   │   │   │   ├── ParametroRequestDTO.java
│       │   │   │   │   └── CategoriaRequestDTO.java
│       │   │   │   └── response/
│       │   │   │       ├── AuthResponseDTO.java
│       │   │   │       ├── UsuarioResponseDTO.java
│       │   │   │       ├── ReceitaResponseDTO.java
│       │   │   │       ├── DespesaResponseDTO.java
│       │   │   │       ├── MetaResponseDTO.java
│       │   │   │       ├── ParametroResponseDTO.java
│       │   │   │       ├── CategoriaResponseDTO.java
│       │   │   │       ├── DashboardResponseDTO.java
│       │   │   │       └── PageResponseDTO.java
│       │   │   ├── exception/
│       │   │   │   ├── GlobalExceptionHandler.java
│       │   │   │   ├── ResourceNotFoundException.java
│       │   │   │   ├── ValidationException.java
│       │   │   │   ├── UnauthorizedException.java
│       │   │   │   └── DuplicateResourceException.java
│       │   │   ├── validation/
│       │   │   │   ├── UniqueEmail.java
│       │   │   │   ├── ValidPassword.java
│       │   │   │   └── FutureOrPresentDate.java
│       │   │   ├── mapper/
│       │   │   │   ├── UsuarioMapper.java
│       │   │   │   ├── ReceitaMapper.java
│       │   │   │   ├── DespesaMapper.java
│       │   │   │   └── MetaMapper.java
│       │   │   └── util/
│       │   │       ├── DateUtil.java
│       │   │       ├── CalculadoraFinanceira.java
│       │   │       └── SecurityUtil.java
│       │   └── resources/
│       │       ├── application.properties
│       │       ├── application-dev.properties
│       │       ├── application-prod.properties
│       │       └── db/migration/
│       │           ├── V1__create_usuarios_table.sql
│       │           ├── V2__create_receitas_table.sql
│       │           ├── V3__create_despesas_table.sql
│       │           ├── V4__create_metas_table.sql
│       │           ├── V5__create_categorias_table.sql
│       │           ├── V6__create_transacoes_meta_table.sql
│       │           ├── V7__create_parametros_table.sql
│       │           ├── V8__add_foreign_keys.sql
│       │           ├── V9__create_indexes.sql
│       │           └── V10__insert_initial_data.sql
│       └── test/
│           └── java/com/financeiro/
│               ├── controller/
│               ├── service/
│               ├── repository/
│               └── integration/
│
└── frontend/
    ├── Dockerfile
    ├── Dockerfile.prod
    ├── package.json
    ├── .env
    ├── .env.example
    ├── .eslintrc.js
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── components/
        │   ├── common/
        │   │   ├── Header.jsx
        │   │   ├── Sidebar.jsx
        │   │   ├── Footer.jsx
        │   │   ├── Loading.jsx
        │   │   ├── ErrorMessage.jsx
        │   │   ├── Pagination.jsx
        │   │   ├── ProtectedRoute.jsx
        │   │   └── Modal.jsx
        │   ├── auth/
        │   │   ├── LoginForm.jsx
        │   │   ├── RegisterForm.jsx
        │   │   └── ProfilePage.jsx
        │   ├── dashboard/
        │   │   ├── Dashboard.jsx
        │   │   ├── ResumoFinanceiro.jsx
        │   │   ├── GraficoReceitas.jsx
        │   │   ├── GraficoDespesas.jsx
        │   │   ├── MetasWidget.jsx
        │   │   └── ComparativoMensal.jsx
        │   ├── receitas/
        │   │   ├── ReceitasList.jsx
        │   │   ├── ReceitaForm.jsx
        │   │   └── ReceitaDetail.jsx
        │   ├── despesas/
        │   │   ├── DespesasList.jsx
        │   │   ├── DespesaForm.jsx
        │   │   ├── DespesaDetail.jsx
        │   │   └── DespesaFilters.jsx
        │   ├── metas/
        │   │   ├── MetasList.jsx
        │   │   ├── MetaForm.jsx
        │   │   ├── MetaDetail.jsx
        │   │   ├── MetaProgressBar.jsx
        │   │   └── AporteForm.jsx
        │   ├── categorias/
        │   │   ├── CategoriasList.jsx
        │   │   └── CategoriaForm.jsx
        │   └── parametros/
        │       ├── ParametrosList.jsx
        │       └── ParametroForm.jsx
        ├── services/
        │   ├── api.js
        │   ├── authService.js
        │   ├── receitaService.js
        │   ├── despesaService.js
        │   ├── metaService.js
        │   ├── parametroService.js
        │   ├── categoriaService.js
        │   └── dashboardService.js
        ├── hooks/
        │   ├── useAuth.js
        │   ├── useReceitas.js
        │   ├── useDespesas.js
        │   ├── useMetas.js
        │   ├── usePagination.js
        │   └── useDashboard.js
        ├── store/
        │   ├── authStore.js
        │   ├── financeiroStore.js
        │   └── uiStore.js
        ├── utils/
        │   ├── dateFormatter.js
        │   ├── currencyFormatter.js
        │   ├── validators.js
        │   └── tokenManager.js
        ├── styles/
        │   ├── globals.css
        │   └── animations.css
        └── routes/
            └── AppRoutes.jsx
```

## 🗄️ Modelo de Dados

### Diagrama Entidade-Relacionamento

```
┌─────────────────────┐
│      USUARIOS       │
│─────────────────────│
│ 🔑 id (PK)          │
│ 🔒 email (UNIQUE)   │
│    senha_hash       │
│    nome             │
│    foto_url         │
│    tipo_usuario     │
│    ativo            │
│    created_at       │
│    updated_at       │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│      RECEITAS       │
│─────────────────────│
│ 🔑 id (PK)          │
│ 🔗 usuario_id (FK)  │
│    periodo_inicio   │
│    periodo_fim      │
│    dias_uteis       │
│    salario          │
│    auxilios         │
│    servicos_extras  │
│    observacoes      │
│    created_at       │
│    updated_at       │
└─────────────────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│      DESPESAS       │
│─────────────────────│
│ 🔑 id (PK)          │
│ 🔗 usuario_id (FK)  │──┐
│ 🔗 receita_id (FK)  │  │
│ 🔗 categoria_id (FK)│  │ N:1
│    data             │  │
│    descricao        │  │
│    valor            │  │
│    status           │  │
│    parcela_atual    │  │
│    parcela_total    │  │
│    fim_pagamento    │  │
│    observacoes      │  │
│    created_at       │  │
│    updated_at       │  │
└─────────────────────┘  │
                         │
┌─────────────────────┐  │
│     CATEGORIAS      │◄─┘
│─────────────────────│
│ 🔑 id (PK)          │
│ 🔗 usuario_id (FK)  │
│    nome             │
│    tipo             │
│    ativa            │
│    created_at       │
└─────────────────────┘

┌─────────────────────┐
│       METAS         │
│─────────────────────│
│ 🔑 id (PK)          │
│ 🔗 usuario_id (FK)  │──┐
│    nome             │  │
│    descricao        │  │
│    tipo             │  │
│    valor_objetivo   │  │
│    valor_atual      │  │
│    prazo            │  │
│    status           │  │
│    progresso        │  │
│    observacoes      │  │
│    created_at       │  │
│    updated_at       │  │
└─────────────────────┘  │
           │             │
           │ 1:N         │
           │             │
┌──────────▼──────────┐  │
│  TRANSACOES_META    │  │
│─────────────────────│  │
│ 🔑 id (PK)          │  │
│ 🔗 meta_id (FK)     │──┘
│    valor            │
│    data             │
│    descricao        │
│    tipo             │
│    created_at       │
└─────────────────────┘

┌─────────────────────┐
│     PARAMETROS      │
│─────────────────────│
│ 🔑 id (PK)          │
│ 🔗 usuario_id (FK)  │
│    chave (UNIQUE)   │
│    descricao        │
│    valor            │
│    tipo             │
│    created_at       │
│    updated_at       │
└─────────────────────┘
```

### Scripts SQL de Criação

#### V2__create_receitas_table.sql

```sql
CREATE TABLE receitas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    dias_uteis INTEGER,
    salario DECIMAL(10,2) DEFAULT 0.00,
    auxilios DECIMAL(10,2) DEFAULT 0.00,
    servicos_extras DECIMAL(10,2) DEFAULT 0.00,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_receitas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_receitas_usuario_periodo ON receitas(usuario_id, periodo_inicio, periodo_fim);
```

#### V5__create_categorias_table.sql

```sql
CREATE TABLE categorias (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('RECEITA', 'DESPESA')),
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categorias_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT uk_categoria_usuario_nome UNIQUE (usuario_id, nome)
);

CREATE INDEX idx_categorias_usuario_tipo ON categorias(usuario_id, tipo, ativa);
```

### Índices de Performance

```sql
-- Autenticação
CREATE UNIQUE INDEX idx_usuarios_email ON usuarios(email);

-- Queries frequentes
CREATE INDEX idx_despesas_usuario_data ON despesas(usuario_id, data DESC);
CREATE INDEX idx_receitas_usuario_periodo ON receitas(usuario_id, periodo_inicio, periodo_fim);
CREATE INDEX idx_metas_usuario_status ON metas(usuario_id, status) WHERE status != 'CONCLUIDA';

-- Filtros
CREATE INDEX idx_despesas_categoria ON despesas(categoria_id);
CREATE INDEX idx_despesas_status ON despesas(status);
CREATE INDEX idx_categorias_usuario_tipo ON categorias(usuario_id, tipo, ativa);

-- Relacionamentos
CREATE INDEX idx_transacoes_meta ON transacoes_meta(meta_id, data DESC);
CREATE INDEX idx_despesas_receita ON despesas(receita_id);

-- Índice parcial
CREATE INDEX idx_despesas_pendentes ON despesas(usuario_id, data) 
WHERE status = 'PENDENTE';
```

## 🔌 API REST - Endpoints

### Base URL

**Desenvolvimento**: `http://localhost:8080/api`
**Produção**: `https://api.financeiro.com/api`

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/register` | Registrar novo usuário | ❌ |
| POST | `/auth/login` | Login e geração de JWT | ❌ |
| POST | `/auth/refresh` | Renovar token expirado | ✅ |
| POST | `/auth/logout` | Invalidar token | ✅ |
| GET | `/auth/me` | Dados do usuário logado | ✅ |

### Usuários

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/usuarios/{id}` | Buscar usuário por ID | ✅ |
| PUT | `/usuarios/{id}` | Atualizar perfil | ✅ |
| PUT | `/usuarios/{id}/senha` | Alterar senha | ✅ |
| DELETE | `/usuarios/{id}` | Desativar conta | ✅ |

### Receitas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/receitas?page=0&size=20&sort=periodo_inicio,desc` | Listar com paginação | ✅ |
| GET | `/receitas/{id}` | Buscar receita por ID | ✅ |
| GET | `/receitas/periodo?inicio={data}&fim={data}` | Filtrar por período | ✅ |
| GET | `/receitas/resumo?ano={ano}` | Resumo anual | ✅ |
| POST | `/receitas` | Criar nova receita | ✅ |
| PUT | `/receitas/{id}` | Atualizar receita | ✅ |
| DELETE | `/receitas/{id}` | Deletar receita | ✅ |

### Despesas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/despesas?page=0&size=20&sort=data,desc` | Listar com paginação | ✅ |
| GET | `/despesas/{id}` | Buscar despesa por ID | ✅ |
| GET | `/despesas/filtros?categoria={id}&status={status}&dataInicio={data}` | Filtros avançados | ✅ |
| GET | `/despesas/categoria/{id}?page=0` | Filtrar por categoria | ✅ |
| GET | `/despesas/periodo?inicio={data}&fim={data}&page=0` | Período com paginação | ✅ |
| GET | `/despesas/resumo-mensal?mes={mes}&ano={ano}` | Resumo mensal | ✅ |
| POST | `/despesas` | Criar nova despesa | ✅ |
| PUT | `/despesas/{id}` | Atualizar despesa | ✅ |
| DELETE | `/despesas/{id}` | Deletar despesa | ✅ |

### Metas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/metas?page=0&size=20&sort=prazo,asc` | Listar com paginação | ✅ |
| GET | `/metas/{id}` | Buscar meta por ID | ✅ |
| GET | `/metas/status/{status}?page=0` | Filtrar por status | ✅ |
| GET | `/metas/{id}/transacoes?page=0` | Histórico de aportes | ✅ |
| GET | `/metas/resumo` | Resumo de todas as metas | ✅ |
| POST | `/metas` | Criar nova meta | ✅ |
| POST | `/metas/{id}/aportes` | Adicionar aporte | ✅ |
| PUT | `/metas/{id}` | Atualizar meta | ✅ |
| DELETE | `/metas/{id}` | Deletar meta | ✅ |

### Categorias

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/categorias` | Listar categorias | ✅ |
| GET | `/categorias/{id}` | Buscar categoria por ID | ✅ |
| GET | `/categorias/tipo/{tipo}` | Filtrar por tipo | ✅ |
| POST | `/categorias` | Criar nova categoria | ✅ |
| PUT | `/categorias/{id}` | Atualizar categoria | ✅ |
| DELETE | `/categorias/{id}` | Desativar categoria | ✅ |

### Parâmetros

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/parametros` | Listar todos parâmetros | ✅ |
| GET | `/parametros/{id}` | Buscar parâmetro por ID | ✅ |
| GET | `/parametros/chave/{chave}` | Buscar por chave | ✅ |
| PUT | `/parametros/{id}` | Atualizar parâmetro | ✅ |

### Dashboard

| Método | Endpoint | Descrição | Auth | Cache |
|--------|----------|-----------|------|-------|
| GET | `/dashboard?mes={mes}&ano={ano}` | Dados consolidados | ✅ | 5min |
| GET | `/dashboard/receitas-totais?periodo={mes/ano}` | Total receitas | ✅ | 5min |
| GET | `/dashboard/despesas-totais?periodo={mes/ano}` | Total despesas | ✅ | 5min |
| GET | `/dashboard/saldo` | Saldo atual | ✅ | 1min |
| GET | `/dashboard/comparativo?mesInicio={mes1}&mesFim={mes2}` | Comparação períodos | ✅ | 10min |
| GET | `/dashboard/evolucao?meses={n}` | Evolução últimos N meses | ✅ | 10min |
| GET | `/dashboard/categorias-top?limite={n}` | Top categorias | ✅ | 5min |

### Formato de Resposta

**Sucesso**:
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

**Erro**:
```json
{
  "status": "error",
  "message": "Descrição do erro",
  "errors": [
    {
      "field": "email",
      "message": "Email já cadastrado"
    }
  ],
  "timestamp": "2024-11-07T10:30:00Z"
}
```

**Paginação**:
```json
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalPages": 5,
  "totalElements": 98,
  "first": true,
  "last": false
}
```

## 🛠️ Tecnologias e Bibliotecas

### Backend (Java/Spring Boot)

#### Core Framework
- **Spring Boot 3.2+** - Framework principal
- **Java 17+** - Linguagem
- **Maven 3.9+** - Gerenciador de dependências[2][1]

#### Banco de Dados & Persistência
- **Spring Data JPA** - ORM e abstração de dados
- **PostgreSQL Driver 42.7+** - Driver JDBC
- **Flyway 10+** - Migrations de banco de dados
- **HikariCP** - Connection pool otimizado[6][5]

#### Segurança
- **Spring Security 6+** - Framework de segurança
- **JJWT 0.12+** - Geração e validação de JWT
- **Argon2** - Hash de senhas (mais seguro que BCrypt)

#### Cache & Performance
- **Spring Boot Starter Cache** - Abstração de cache
- **Caffeine Cache** - Cache local em memória (TTL configurável)
[1][4]

#### Validação & Documentação
- **Spring Boot Starter Validation** - Validações Bean Validation
- **Hibernate Validator** - Implementação JSR 380
- **SpringDoc OpenAPI 2.3+** - Documentação API (Swagger UI)

#### Monitoramento & Observabilidade
- **Spring Boot Actuator** - Health checks e métricas
- **Micrometer** - Métricas de aplicação

#### Utilitários
- **Lombok** - Redução de boilerplate
- **MapStruct** - Mapeamento entre DTOs e entidades
- **Apache Commons Lang3** - Utilitários Java

### Frontend (React/JavaScript)

#### Core Framework
- **React 18.3+** - Biblioteca UI
- **Vite 5+** - Build tool e dev server
- **JavaScript (ES6+)** - Linguagem

#### Roteamento & Navegação
- **React Router DOM 6+** - Roteamento client-side

#### UI & Estilização
- **TailwindCSS 3.4+** - Framework CSS utility-first
- **HeadlessUI** - Componentes acessíveis
- **Lucide React** - Biblioteca de ícones
- **Framer Motion** - Animações e transições

#### Gerenciamento de Estado
- **Zustand 4.5+** - State management global
- **React Hook Form 7+** - Gerenciamento de formulários
- **Zod 3+** - Validação de schemas TypeScript-first

#### API & Data Fetching
- **TanStack React Query 5+** - Cache, sincronização e estado servidor
- **Axios 1.6+** - Cliente HTTP

#### Gráficos & Visualização
- **Recharts 2.12+** - Biblioteca de gráficos

#### Utilitários
- **date-fns 3+** - Manipulação de datas
- **clsx** - Classes CSS condicionais
- **tailwind-merge** - Merge de classes Tailwind

#### Testes
- **Vitest** - Framework de testes unitários
- **Testing Library** - Testes de componentes
- **Playwright** - Testes E2E

### DevOps & Infraestrutura

#### Containerização
- **Docker 24+** - Containerização de aplicações
- **Docker Compose** - Orquestração multi-container[5][6]

#### CI/CD
- **GitHub Actions** - Pipeline de integração contínua
- **Git** - Controle de versão

#### Banco de Dados
- **PostgreSQL 16** - Banco de dados relacional (Docker no Railway)[6][5]

#### Monitoramento (Produção)
- **Sentry (opcional)** - Error tracking
- **New Relic (opcional)** - APM

## 🚀 Deploy

### Estratégia de Deploy Recomendada

```
┌────────────────────────────────────────────────────┐
│              DEPLOYMENT ARCHITECTURE                │
├────────────────────────────────────────────────────┤
│                                                     │
│  Frontend (Vercel)                                 │
│  ├─ Build: Vite                                    │
│  ├─ CDN: Global                                    │
│  ├─ SSL: Automático                                │
│  └─ Deploy: Git push → Auto deploy                │
│                                                     │
│  Backend (Railway.app)                             │
│  ├─ Runtime: Docker Container                      │
│  ├─ Build: Maven + Docker                          │
│  ├─ Scale: Vertical automático                     │
│  └─ Deploy: Git push → Build → Deploy             │
│                                                     │
│  Database (Railway.app)                            │
│  ├─ PostgreSQL 16 (Docker)                         │
│  ├─ Backup: Automático diário                      │
│  ├─ Storage: Persistente com volumes               │
│  └─ Network: Rede privada do projeto              │
│                                                     │
└────────────────────────────────────────────────────┘
```

### Railway.app + Vercel (RECOMENDADO ⭐)

#### Vantagens
✅ Setup simples e rápido
✅ $5 grátis/mês (suficiente para projetos pequenos)
✅ PostgreSQL via Docker incluído
✅ Deploy automático via Git
✅ Logs e métricas integrados
✅ Escala automaticamente
✅ SSL/HTTPS gratuito[7][5][6]

#### Custos Estimados

| Serviço | Custo Mensal | Tier |
|---------|--------------|------|
| Backend (Railway) | $2-3 | Dentro do crédito grátis |
| PostgreSQL (Railway) | Incluído | Docker no mesmo projeto |
| Frontend (Vercel) | $0 | Free tier |
| **TOTAL** | **$0-3** | Dentro do crédito grátis |

### Passo a Passo

#### 1. PostgreSQL no Railway.app

```bash
# 1. Criar conta em railway.app
# 2. Criar novo projeto

# 3. Adicionar PostgreSQL via Docker
railway add

# Selecionar: Docker Image
# Image: postgres:16-alpine

# 4. Configurar variáveis de ambiente do PostgreSQL
POSTGRES_DB=financeiro_db
POSTGRES_USER=financeiro_user
POSTGRES_PASSWORD=seu-password-seguro
PGDATA=/var/lib/postgresql/data

# 5. Adicionar volume para persistência
# Mount Path: /var/lib/postgresql/data
# Size: 1GB
```

Configuração do PostgreSQL Service:
```yaml
# railway.json (para o serviço PostgreSQL)
{
  "build": {
    "dockerfile": "Dockerfile.postgres"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Configurações Docker

#### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health Check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

#### docker-compose.yml (Desenvolvimento Local)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: financeiro-db
    environment:
      POSTGRES_DB: financeiro_db
      POSTGRES_USER: financeiro_user
      POSTGRES_PASSWORD: financeiro_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - financeiro-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U financeiro_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: financeiro-backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/financeiro_db
      SPRING_DATASOURCE_USERNAME: financeiro_user
      SPRING_DATASOURCE_PASSWORD: financeiro_pass
      CACHE_ENABLED: "true"
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - financeiro-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: financeiro-frontend
    environment:
      VITE_API_URL: http://localhost:8080/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - financeiro-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  financeiro-network:
    driver: bridge
```

### Checklist de Deploy

#### Antes do Deploy
- [ ] Configurar variáveis de ambiente de produção
- [ ] Alterar JWT_SECRET para valor seguro (min. 256 bits)
- [ ] Configurar CORS com domínios corretos
- [ ] Revisar application-prod.properties
- [ ] Testar migrations do Flyway
- [ ] Configurar backup automático do banco
- [ ] Revisar logs e métricas
- [ ] Configurar alertas (opcional)

#### Após o Deploy
- [ ] Testar autenticação JWT
- [ ] Verificar endpoints da API
- [ ] Testar criação de dados
- [ ] Validar cache Caffeine
- [ ] Monitorar logs por 24h
- [ ] Testar em diferentes navegadores
- [ ] Verificar responsividade mobile
- [ ] Configurar domínio customizado (opcional)

## 📊 Cache Strategy

### Arquitetura de Cache com Caffeine

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                      │
│  React Query (Stale-While-Revalidate)          │
│  - TTL: 5 minutos                               │
│  - Revalidação em background                    │
│  - Cache por query key                          │
└────────────────┬────────────────────────────────┘
                 │ HTTP
                 │
┌────────────────▼────────────────────────────────┐
│                   BACKEND                       │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Caffeine Cache (Local em Memória)     │   │
│  │  - Dashboard: 5 minutos                 │   │
│  │  - Resumos: 10 minutos                  │   │
│  │  - Parâmetros: 1 hora                   │   │
│  │  - Categorias: 30 minutos               │   │
│  │  - Max: 1000 entradas                   │   │
│  │  - Eviction: LRU                        │   │
│  └─────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│               POSTGRESQL                        │
│  - Índices otimizados                           │
│  - Queries eficientes                           │
└─────────────────────────────────────────────────┘
```

### Estratégias de Invalidação
- **Write-Through**: Atualiza cache ao salvar
- **Invalidação Seletiva**: Remove apenas chaves afetadas
- **TTL Adaptativo**: Ajusta tempo baseado em uso[4][1]

## 🔒 Segurança

### Camadas de Segurança

#### 1. Autenticação JWT
- Token assinado com HS512
- Expiração: 24 horas
- Refresh token: 7 dias
- Armazenamento: localStorage (frontend)

#### 2. Proteções Implementadas

| Ameaça | Proteção | Implementação |
|--------|----------|---------------|
| SQL Injection | Parameterized Queries | JPA/Hibernate |
| XSS | Auto-escape | React + Sanitização |
| CSRF | JWT Stateless | Não necessário |
| CORS | Whitelist Origins | Spring Security |
| Rate Limiting | Token Bucket | Resilience4j |
| Brute Force | Bloqueio temporário | Custom Filter |

#### 3. Validações

**Backend**:
- Bean Validation (@NotNull, @Email, @Min, @Max)
- Custom validators
- DTO validation

**Frontend**:
- Zod schemas
- Real-time validation
- Type-safe

## 📚 Documentação Adicional

Para informações detalhadas sobre fluxos e processos, consulte:

- **Diagramas de Fluxo** - Fluxos detalhados da aplicação
  - Autenticação JWT
  - Criação de Despesas
  - Dashboard com Cache
  - Paginação
  - Arquitetura de Segurança
  - Ciclo de Vida
- **API Documentation** - Documentação completa da API REST
- **Deploy Guide** - Guia detalhado de deploy

## 🚀 Quick Start

### Desenvolvimento Local

#### 1. Pré-requisitos
- Docker & Docker Compose
- Java 17+
- Node.js 20+
- Git

#### 2. Clone o repositório
```bash
git clone https://github.com/seu-usuario/financeiro-pessoal.git
cd financeiro-pessoal
```

#### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

#### 4. Inicie os containers
```bash
docker-compose up -d
```

#### 5. Acesse a aplicação
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html

### Build Manual

**Backend**:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

[9](https://www.youtube.com/watch?v=dpniJG_5Dnk)
[10](https://railway.com/deploy/postgresql)
[11](https://github.com/kartik1502/Spring-Boot-Microservices-Banking-Application)
