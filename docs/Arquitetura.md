# 🏗️ Arquitetura do Sistema

## Visão Geral

O Sistema de Gestão Financeira Pessoal foi projetado seguindo os princípios de **Clean Architecture**, **Domain-Driven Design (DDD)** e padrões de **Microservices**, garantindo escalabilidade, manutenibilidade e testabilidade.

## Índice

1. [Princípios Arquiteturais](#princípios-arquiteturais)
2. [Arquitetura de Alto Nível](#arquitetura-de-alto-nível)
3. [Camadas da Aplicação](#camadas-da-aplicação)
4. [Padrões de Design](#padrões-de-design)
5. [Comunicação entre Componentes](#comunicação-entre-componentes)
6. [Estratégia de Cache](#estratégia-de-cache)
7. [Processamento Assíncrono](#processamento-assíncrono)
8. [Arquitetura de IA](#arquitetura-de-ia)
9. [Escalabilidade](#escalabilidade)
10. [Resiliência e Tolerância a Falhas](#resiliência-e-tolerância-a-falhas)

---

## Princípios Arquiteturais

### 1. Separation of Concerns
Cada componente tem uma responsabilidade clara e bem definida:
- **Frontend**: Apresentação e experiência do usuário
- **Backend API**: Lógica de negócio e orquestração
- **AI Service**: Análises preditivas e machine learning
- **Database**: Persistência e consistência de dados

### 2. Single Responsibility Principle (SRP)
- Cada classe/módulo possui uma única razão para mudar
- Services focados em domínios específicos
- Controllers responsáveis apenas por HTTP handling

### 3. Dependency Inversion
- Dependências apontam para abstrações (interfaces)
- Facilita testes e substituição de implementações
- Uso extensivo de IoC/DI do Spring

### 4. Open/Closed Principle
- Aberto para extensão, fechado para modificação
- Uso de Strategy Pattern para algoritmos variáveis
- Plugin architecture para novos recursos

### 5. API-First Design
- Contratos de API definidos primeiro (OpenAPI)
- Versionamento desde o início
- Documentação automática e sempre atualizada

---

## Arquitetura de Alto Nível

```
┌────────────────────────────────────────────────────────────────────┐
│                          CAMADA DE CLIENTE                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ Web Browser  │  │ Mobile App   │  │ Desktop App (Electron)   │ │
│  │  (React 18)  │  │ (React Native)│  │                          │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬──────────────┘ │
└─────────┼──────────────────┼──────────────────────┼─────────────────┘
          │                  │                      │
          │   HTTPS/WSS      │                      │
          └──────────────────┴──────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                         LOAD BALANCER                               │
│                    (NGINX / Railway Proxy)                          │
│                     SSL Termination • Rate Limiting                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼─────────┐  ┌───────▼─────────┐  ┌──────▼──────────┐
│   API Gateway   │  │  WebSocket      │  │   AI Service    │
│  (Spring Boot)  │  │   Gateway       │  │   (FastAPI)     │
│                 │  │                 │  │                 │
│  • Auth Filter  │  │  • Real-time    │  │  • ML Models    │
│  • Validation   │  │  • Notifications│  │  • Predictions  │
│  • CORS         │  │  • Updates      │  │  • Analytics    │
└───────┬─────────┘  └─────────────────┘  └────────┬────────┘
        │                                           │
┌───────▼───────────────────────────────────────────▼────────┐
│                    APPLICATION LAYER                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │  Auth      │  │ Finance    │  │  AI Integration    │   │
│  │  Service   │  │ Service    │  │  Service           │   │
│  └─────┬──────┘  └─────┬──────┘  └──────┬─────────────┘   │
│        │               │                │                  │
│  ┌─────▼───────────────▼────────────────▼─────────────┐   │
│  │            DOMAIN / BUSINESS LOGIC                  │   │
│  │  • Receitas  • Despesas  • Metas  • Categorias     │   │
│  │  • Validações  • Regras de Negócio  • Cálculos     │   │
│  └─────────────────────────┬───────────────────────────┘   │
└────────────────────────────┼───────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼─────────┐  ┌───────▼─────────┐  ┌──────▼──────────┐
│   PostgreSQL    │  │     Redis       │  │  Message Queue  │
│   (Primary)     │  │                 │  │   (Redis PubSub)│
│                 │  │  • Cache        │  │                 │
│  • ACID         │  │  • Sessions     │  │  • Events       │
│  • Transactions │  │  • Rate Limit   │  │  • Jobs         │
│  • Replication  │  │  • Pub/Sub      │  │  • Notifications│
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Camadas da Aplicação

### 1. Presentation Layer (Frontend)

```
frontend/src/
├── components/          # Componentes React organizados por feature
│   ├── auth/           # Autenticação e autorização
│   ├── dashboard/      # Dashboard e visualizações
│   ├── despesas/       # Gestão de despesas
│   ├── receitas/       # Gestão de receitas
│   ├── metas/          # Metas financeiras
│   ├── ia/             # Recursos de IA
│   └── common/         # Componentes compartilhados
├── services/           # Camada de comunicação com APIs
├── hooks/              # Custom React Hooks
├── store/              # Estado global (Zustand)
├── utils/              # Utilitários e helpers
└── routes/             # Configuração de rotas
```

**Responsabilidades:**
- Renderização de UI e interação do usuário
- Validação client-side
- Estado local e global
- Comunicação com backend via REST/WebSocket
- Cache de dados (React Query)

**Tecnologias:**
- React 18 (Concurrent Features)
- React Router 6 (Nested Routes)
- Zustand (State Management)
- TanStack Query (Server State)
- TailwindCSS (Styling)
- Framer Motion (Animations)

---

### 2. API Gateway Layer (Backend)

```
backend/src/main/java/com/financeiro/
├── controller/         # REST Controllers (HTTP Layer)
│   ├── AuthController
│   ├── ReceitaController
│   ├── DespesaController
│   ├── MetaController
│   ├── DashboardController
│   └── IAController
├── security/           # Autenticação e autorização
│   ├── JwtTokenProvider
│   ├── JwtAuthenticationFilter
│   └── SecurityConfig
└── config/            # Configurações Spring
    ├── CorsConfig
    ├── CacheConfig
    └── OpenApiConfig
```

**Responsabilidades:**
- Roteamento de requisições HTTP
- Autenticação JWT
- Validação de entrada
- Serialização/Deserialização JSON
- Exception handling
- CORS e Security Headers

**Padrões Implementados:**
- **DTO Pattern**: Transferência de dados entre camadas
- **Request/Response Pattern**: Separação de contratos de entrada/saída
- **Exception Handler**: Tratamento centralizado de erros

---

### 3. Application/Service Layer

```
backend/src/main/java/com/financeiro/service/
├── UsuarioService          # Gestão de usuários
├── ReceitaService          # Lógica de receitas
├── DespesaService          # Lógica de despesas
├── MetaService             # Gerenciamento de metas
├── CategoriaService        # Categorias customizadas
├── DashboardService        # Agregações e analytics
├── TransacaoMetaService    # Aportes em metas
├── IAService               # Integração com serviço IA
├── NotificacaoService      # Sistema de notificações
├── ImportacaoService       # Importação de extratos
└── RelatorioService        # Geração de relatórios
```

**Responsabilidades:**
- Implementação de casos de uso
- Orquestração de operações complexas
- Validação de regras de negócio
- Transações e consistência
- Integração com serviços externos
- Cache management

**Características:**
- **Transactional**: Garantia ACID com `@Transactional`
- **Async**: Operações assíncronas com `@Async`
- **Cacheable**: Cache declarativo com `@Cacheable`
- **Event-Driven**: Publicação de eventos de domínio

---

### 4. Domain Layer

```
backend/src/main/java/com/financeiro/
├── model/              # Entidades de domínio
│   ├── Usuario
│   ├── Receita
│   ├── Despesa
│   ├── Meta
│   ├── Categoria
│   ├── TransacaoMeta
│   └── enums/
│       ├── StatusPagamento
│       ├── TipoMeta
│       └── StatusMeta
├── repository/         # Interfaces de persistência
└── projection/        # Projeções para queries otimizadas
```

**Responsabilidades:**
- Modelagem do domínio do negócio
- Encapsulamento de regras de domínio
- Value Objects e invariantes
- Relacionamentos entre entidades

**Princípios DDD Aplicados:**
- **Entities**: Objetos com identidade única
- **Value Objects**: Objetos imutáveis (enums)
- **Aggregates**: Agrupamento de entidades relacionadas
- **Domain Events**: Eventos de mudança de estado

---

### 5. Data Access Layer

```
backend/src/main/java/com/financeiro/repository/
├── UsuarioRepository
├── ReceitaRepository
├── DespesaRepository
├── MetaRepository
├── CategoriaRepository
└── TransacaoMetaRepository
```

**Responsabilidades:**
- Abstração de persistência
- Queries customizadas (JPQL, Native SQL)
- Projeções otimizadas
- Paginação e ordenação

**Tecnologias:**
- Spring Data JPA
- Hibernate (ORM)
- QueryDSL (Type-safe queries)
- Database migrations (Flyway)

---

### 6. AI Service Layer

```
ai-service/
├── app/
│   ├── models/             # Modelos ML
│   │   ├── expense_predictor.py
│   │   ├── anomaly_detector.py
│   │   ├── category_classifier.py
│   │   └── budget_optimizer.py
│   ├── services/           # Lógica de IA
│   │   ├── prediction_service.py
│   │   ├── analysis_service.py
│   │   └── recommendation_service.py
│   ├── api/               # Endpoints FastAPI
│   ├── utils/             # Utilitários ML
│   └── training/          # Scripts de treinamento
└── tests/
```

**Responsabilidades:**
- Treinamento de modelos ML
- Inferência e predições
- Análise de padrões
- Geração de insights
- Recomendações personalizadas

**Modelos Implementados:**

1. **Expense Predictor** (Regressão)
   - Algoritmo: Random Forest Regressor
   - Prediz gastos futuros baseado em histórico
   - Accuracy: ~85%

2. **Anomaly Detector** (Detecção de Outliers)
   - Algoritmo: Isolation Forest
   - Detecta gastos anormais
   - Precision: ~90%

3. **Category Classifier** (Classificação)
   - Algoritmo: Naive Bayes + TF-IDF
   - Categoriza transações automaticamente
   - F1-Score: ~88%

4. **Budget Optimizer** (Otimização)
   - Algoritmo: Linear Programming
   - Sugere alocação ótima de recursos
   - Baseado em prioridades e restrições

---

## Padrões de Design

### Backend Patterns

#### 1. Repository Pattern
```
Interface Repository ← JPA Repository
        ↑
    Service Layer
```
- Abstrai lógica de acesso a dados
- Facilita testes com mocks
- Permite trocar implementação

#### 2. DTO (Data Transfer Object)
```
Controller → Request DTO → Service
Service → Response DTO → Controller
```
- Separa modelo de domínio da API
- Validação centralizada
- Versionamento facilitado

#### 3. Mapper Pattern
```
Entity ←→ Mapper ←→ DTO
```
- Conversão entre camadas
- Implementado com MapStruct
- Type-safe e performático

#### 4. Strategy Pattern (IA)
```
interface PredictionStrategy {
    predict(data)
}

class ExpensePrediction implements PredictionStrategy
class RevenuePrediction implements PredictionStrategy
class BudgetOptimization implements PredictionStrategy
```

#### 5. Observer Pattern (Events)
```
@EventListener
public void handleDespesaCriada(DespesaCriadaEvent event) {
    // Atualizar cache
    // Recalcular metas
    // Enviar notificação
}
```

#### 6. Facade Pattern (Dashboard)
```
DashboardService {
    getResumoCompleto() {
        receitas = receitaService.getTotais()
        despesas = despesaService.getTotais()
        metas = metaService.getProgresso()
        insights = iaService.getInsights()
        return aggregate(all)
    }
}
```

### Frontend Patterns

#### 1. Container/Presenter Pattern
```
Container (Logic) → Presenter (UI)
```

#### 2. Custom Hooks Pattern
```
useReceitas() → { data, loading, error, create, update, delete }
```

#### 3. Compound Components
```
<Modal>
  <Modal.Header />
  <Modal.Body />
  <Modal.Footer />
</Modal>
```

---

## Comunicação entre Componentes

### 1. REST API (Síncrono)

**Request Flow:**
```
Frontend → API Gateway → Service → Repository → Database
          ↓
       Response
```

**Headers Padrão:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
X-Request-ID: <UUID>
X-User-ID: <USER_ID>
```

### 2. WebSocket (Real-time)

**Eventos Suportados:**
```
WS /ws/notifications
  → despesa.criada
  → meta.atualizada
  → alerta.anomalia
  → insight.disponivel
```

**Implementação:**
```
Spring WebSocket + SockJS + STOMP
```

### 3. Event-Driven (Assíncrono)

**Event Bus (Redis Pub/Sub):**
```
Publisher → Redis Channel → Subscriber(s)
```

**Eventos de Domínio:**
- `DespesaCriadaEvent`
- `MetaConcluidaEvent`
- `LimiteExcedidoEvent`
- `AnomaliaDetectadaEvent`

---

## Estratégia de Cache

### Arquitetura Multi-Layer Cache

```
┌─────────────────────────────────────────────────┐
│            FRONTEND (Browser)                   │
│  React Query Cache • Service Worker Cache       │
│  TTL: 5min • Stale-While-Revalidate             │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│          BACKEND (Application)                  │
│  ┌──────────────────────────────────────────┐  │
│  │      Caffeine Cache (L1 - Local)         │  │
│  │  • Dashboard: 5min                        │  │
│  │  • Resumos: 10min                         │  │
│  │  • Categorias: 30min                      │  │
│  │  • Max: 10,000 entries                    │  │
│  │  • Eviction: LRU                          │  │
│  └────────────┬─────────────────────────────┘  │
│               │ Cache Miss                     │
│  ┌────────────▼─────────────────────────────┐  │
│  │      Redis Cache (L2 - Distributed)      │  │
│  │  • Sessões: 24h                           │  │
│  │  • Rate Limiting: 1h                      │  │
│  │  • Shared Data: varies                    │  │
│  └────────────┬─────────────────────────────┘  │
└───────────────┼─────────────────────────────────┘
                │ Cache Miss
┌───────────────▼─────────────────────────────────┐
│           DATABASE (PostgreSQL)                  │
│  • Query Result Cache                            │
│  • Materialized Views                            │
└──────────────────────────────────────────────────┘
```

### Cache Keys Strategy

**Pattern:** `{entity}:{scope}:{identifier}:{params}`

```
dashboard:user:123:2024-01
receitas:user:123:page:0:size:20
despesas:resumo:user:123:mes:01:ano:2024
categorias:user:123:tipo:DESPESA
ia:predictions:user:123:tipo:expense
```

### Cache Invalidation

**Estratégias:**

1. **Time-based (TTL)**
   - Dashboard: 5 minutos
   - Resumos: 10 minutos
   - Dados estáticos: 1 hora

2. **Event-based**
   ```
   @CacheEvict quando:
   - Nova despesa criada
   - Receita atualizada
   - Meta modificada
   ```

3. **Manual Invalidation**
   - Endpoint: `DELETE /cache/{key}`
   - Bulk: `DELETE /cache/user/{userId}`

---

## Processamento Assíncrono

### Task Queue Architecture

```
┌──────────────┐
│   Producer   │ → publish → Queue → consume → │  Worker  │
│  (Backend)   │             (Redis)            │ (Service)│
└──────────────┘                                └──────────┘
```

### Tipos de Jobs

#### 1. Scheduled Jobs (Cron)
```
@Scheduled(cron = "0 0 1 * * *")  // Todo dia às 01:00
public void processarMetasDiarias() {
    // Atualizar status de metas
    // Calcular progresso
    // Enviar notificações
}
```

#### 2. Event-driven Jobs
```
@Async
@EventListener
public void onDespesaCriada(DespesaCriadaEvent event) {
    // Processar categorização automática
    // Detectar anomalias
    // Atualizar dashboard
}
```

#### 3. Batch Jobs
```
// Importação de extratos bancários
// Geração de relatórios mensais
// Treinamento de modelos ML
// Backup de dados
```

### Job Queue Priorities

```
CRITICAL (0)  : Alertas de segurança
HIGH (1)      : Transações financeiras
MEDIUM (2)    : Notificações
LOW (3)       : Relatórios, analytics
BACKGROUND (4): ML training, cleanup
```

---

## Arquitetura de IA

### ML Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Data      │ → │  Feature    │ → │   Model     │
│ Collection  │    │ Engineering │    │  Training   │
└─────────────┘    └─────────────┘    └─────────────┘
       ↓                  ↓                   ↓
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Storage   │    │ Validation  │    │ Deployment  │
│ (PostgreSQL)│    │             │    │  (FastAPI)  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Model Serving

**Arquitetura:**
```
Request → API Gateway → Model Router → Model Instance
                                    ↓
                            Response + Metadata
```

**Model Versioning:**
```
models/
├── expense_predictor_v1.pkl
├── expense_predictor_v2.pkl  ← Active
├── anomaly_detector_v1.pkl   ← Active
└── category_classifier_v3.pkl ← Active
```

**A/B Testing:**
- 90% → Model v2
- 10% → Model v3 (testing)

### Feature Engineering

**Features Calculadas:**
```python
features = {
    # Temporal
    'dia_mes': int,
    'dia_semana': int,
    'mes': int,
    'quinzena': int,
    
    # Agregadas
    'media_ultimos_30d': float,
    'desvio_padrao_30d': float,
    'total_mes_anterior': float,
    
    # Categóricas
    'categoria_encoded': int,
    'tipo_pagamento': str,
    
    # Calculadas
    'percentual_salario': float,
    'diferenca_media': float
}
```

### Model Retraining

**Strategy:** Incremental Learning

```
Schedule:
- Daily: Update with new data
- Weekly: Validation metrics
- Monthly: Full retraining if metrics drop
- Quarterly: Architecture review
```

---

## Escalabilidade

### Horizontal Scaling

#### Backend (Stateless)
```
Load Balancer
      ↓
┌────────┐  ┌────────┐  ┌────────┐
│ API 1  │  │ API 2  │  │ API 3  │
└───┬────┘  └───┬────┘  └───┬────┘
    └───────────┼───────────┘
                ↓
         Shared Database
```

**Strategy:**
- Auto-scaling baseado em CPU/Memory
- Session em Redis (compartilhado)
- Stateless application design

#### Database (Read Replicas)
```
         Master (Write)
              ↓
    ┌─────────┼─────────┐
    ↓         ↓         ↓
Replica 1  Replica 2  Replica 3
(Read)     (Read)     (Read)
```

**Strategy:**
- Read queries → Replicas
- Write queries → Master
- Eventual consistency acceptable

### Vertical Scaling

**Resource Allocation:**
```
Development:
- API: 512MB RAM, 0.5 CPU
- DB: 1GB RAM, 1 CPU
- Redis: 256MB RAM

Production:
- API: 2GB RAM, 2 CPU
- DB: 8GB RAM, 4 CPU
- Redis: 1GB RAM, 1 CPU
```

### Performance Optimizations

1. **Database Indexing**
   - B-tree indexes em foreign keys
   - Partial indexes para queries frequentes
   - Covering indexes para hot queries

2. **Query Optimization**
   - N+1 prevention (Fetch joins)
   - Pagination obrigatória
   - Projection queries

3. **Connection Pooling**
   - HikariCP (max: 20 connections)
   - Timeout: 30s
   - Idle timeout: 10min

---

## Resiliência e Tolerância a Falhas

### Circuit Breaker Pattern

```
┌──────────────┐
│    Closed    │ ← Normal operation
└──────┬───────┘
       │ Failures exceed threshold
       ↓
┌──────────────┐
│     Open     │ ← Fail fast
└──────┬───────┘
       │ After timeout
       ↓
┌──────────────┐
│  Half-Open   │ ← Test recovery
└──────────────┘
```

**Implementação:**
```java
@CircuitBreaker(name = "iaService", fallbackMethod = "getFallbackPredictions")
public List<Prediction> getPredictions(Long userId) {
    return iaServiceClient.predict(userId);
}

public List<Prediction> getFallbackPredictions(Long userId, Exception e) {
    return cachedPredictions.get(userId);
}
```

### Retry Strategy

**Exponential Backoff:**
```
Attempt 1: Wait 1s
Attempt 2: Wait 2s
Attempt 3: Wait 4s
Max attempts: 3
```

### Health Checks

**Endpoints:**
```
GET /actuator/health        # Overall health
GET /actuator/health/db     # Database
GET /actuator/health/redis  # Redis
GET /actuator/health/ai     # AI Service
```

**Responses:**
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "redis": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

### Graceful Degradation

**Fallback Strategies:**

1. **AI Service Down**
   - Serve cached predictions
   - Disable real-time insights
   - Queue requests for later

2. **Redis Down**
   - Disable caching (direct DB)
   - In-memory session storage
   - Performance degradation acceptable

3. **Database Slow**
   - Serve stale cache data
   - Reduce query complexity
   - Alert administrators

---

## Decisões Arquiteturais (ADRs)

### ADR-001: Escolha do PostgreSQL

**Contexto:** Necessidade de banco relacional robusto

**Decisão:** PostgreSQL 16

**Razões:**
- ACID completo
- JSON support (hybrid model)
- Excelente performance
- Open source
- Comunidade ativa

**Consequências:**
- ✅ Consistência garantida
- ✅ Queries complexas eficientes
- ❌ Escala horizontal mais complexa

---

### ADR-002: Cache Local vs Distribuído

**Decisão:** Caffeine (local) + Redis (distribuído)

**Razões:**
- L1 cache (Caffeine): Latência ultrabaixa
- L2 cache (Redis): Compartilhamento entre instâncias
- Custo-benefício otimizado

---

### ADR-003: Monolito Modular vs Microservices

**Decisão:** Monolito modular com preparação para microservices

**Razões:**
- Simplicidade inicial
- Menor overhead operacional
- Módulos bem definidos facilitam futura separação

**Plano de Migração:**
```
Fase 1: Monolito modular (atual)
Fase 2: Extrair AI Service (feito)
Fase 3: Extrair Notification Service
Fase 4: Extrair Reporting Service
```

---

## Próximos Passos Arquiteturais

1. **Event Sourcing** para auditoria completa
2. **CQRS** para separar reads/writes
3. **API Gateway** dedicado (Kong/Tyk)
4. **Service Mesh** para microservices (Istio)
5. **Observability** completa (OpenTelemetry)

---

**Última Atualização:** Janeiro 2026  
**Versão:** 2.0  
**Responsável:** Arquitetura
