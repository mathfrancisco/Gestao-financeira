Vou analisar os controllers do backend para criar um planejamento detalhado e organizado.
Vou criar um planejamento detalhado baseado na estrutura que você já tem e nas convenções padrão de controllers REST Spring Boot:

# 📋 PLANEJAMENTO DE IMPLEMENTAÇÃO - FRONTEND FINANCEIRO

## 🎯 VISÃO GERAL
Implementação modular e progressiva do frontend React + TypeScript, integrando com os controllers do backend seguindo a ordem: **Auth → Dashboard → Categorias → Receitas → Despesas → Metas → Parâmetros → Usuário**

---

## 📦 MÓDULO 1: AUTENTICAÇÃO (Auth)
**Prioridade:** 🔴 CRÍTICA | **Tempo Estimado:** 2-3 dias

### 1.1. Store (Estado Global)
**Arquivo:** `src/store/authStore.ts`

**O QUE FAZER:**
- Criar store Zustand para gerenciar estado de autenticação
- Armazenar: `user`, `token`, `isAuthenticated`, `isLoading`

**COMO FAZER:**
- Usar `zustand` com `persist` middleware para localStorage
- Implementar actions: `login`, `logout`, `setUser`, `checkAuth`

**COM O QUE FAZER:**
- Zustand (já instalado)
- TypeScript interfaces para User e AuthState

### 1.2. Service (API)
**Arquivo:** `src/services/authService.ts`

**O QUE FAZER:**
- Criar serviço para comunicação com AuthController
- Endpoints esperados: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`

**COMO FAZER:**
```typescript
// Estrutura esperada
- login(email: string, password: string): Promise<AuthResponse>
- register(userData: RegisterDTO): Promise<AuthResponse>
- getCurrentUser(): Promise<User>
- logout(): void
```

**COM O QUE FAZER:**
- Axios (já configurado em `api.ts`)
- Types: `AuthResponse`, `LoginDTO`, `RegisterDTO`, `User`

### 1.3. Utils
**Arquivo:** `src/utils/tokenManager.ts`

**O QUE FAZER:**
- Gerenciar tokens JWT (salvar, recuperar, remover, validar)

**COMO FAZER:**
- Funções: `setToken()`, `getToken()`, `removeToken()`, `isTokenValid()`
- Decodificar JWT para verificar expiração

**COM O QUE FAZER:**
- localStorage
- Função decode JWT (pode usar `jwt-decode` ou implementar manualmente)

### 1.4. Hook Customizado
**Arquivo:** `src/hooks/useAuth.ts`

**O QUE FAZER:**
- Hook para encapsular lógica de autenticação

**COMO FAZER:**
- Retornar: `user`, `login`, `logout`, `register`, `isAuthenticated`, `isLoading`
- Integrar com authStore
- Usar React Query para mutations

**COM O QUE FAZER:**
- `@tanstack/react-query` (já instalado)
- authStore
- authService

### 1.5. Componentes
**Arquivos:** `src/components/auth/`

#### 1.5.1. LoginForm.tsx
**O QUE FAZER:**
- Formulário de login com email e senha
- Validação de campos
- Feedback de erros

**COMO FAZER:**
- Usar `react-hook-form` + `zod` para validação
- Campos: email (required, email format), password (required, min 6 chars)
- Mostrar loading state durante submit
- Redirecionar para `/dashboard` após sucesso

**COM O QUE FAZER:**
- `react-hook-form` + `@hookform/resolvers` (já instalado)
- `zod` (já instalado)
- `useAuth` hook
- Tailwind CSS + lucide-react icons

#### 1.5.2. RegisterForm.tsx
**O QUE FAZER:**
- Formulário de registro
- Campos: nome, email, senha, confirmar senha

**COMO FAZER:**
- Schema Zod com validação de senha match
- Feedback visual de força da senha
- Redirecionar para login após sucesso

**COM O QUE FAZER:**
- Mesmas ferramentas do LoginForm
- Adicionar validação customizada Zod

#### 1.5.3. ProfilePage.tsx
**O QUE FAZER:**
- Exibir dados do usuário logado
- Permitir edição de perfil
- Opção de alterar senha

**COMO FAZER:**
- Buscar dados do usuário via `useAuth`
- Form com campos editáveis
- Modal de confirmação para mudanças críticas

**COM O QUE FAZER:**
- `useAuth` hook
- Modal component (criar em common)
- react-hook-form

### 1.6. Rota Protegida
**Arquivo:** `src/components/common/ProtectedRoute.tsx`

**O QUE FAZER:**
- Componente wrapper para rotas que exigem autenticação

**COMO FAZER:**
- Verificar se usuário está autenticado
- Redirecionar para `/login` se não autenticado
- Mostrar loading enquanto verifica

**COM O QUE FAZER:**
- `react-router-dom` (já instalado)
- `useAuth` hook
- Component Loading

### 1.7. Rotas
**Arquivo:** `src/routes/AppRoutes.tsx`

**O QUE FAZER:**
- Configurar rotas públicas e privadas

**COMO FAZER:**
```typescript
Rotas públicas:
- /login → LoginForm
- /register → RegisterForm

Rotas privadas (com ProtectedRoute):
- /dashboard → Dashboard
- /profile → ProfilePage
- /* → demais rotas
```

**COM O QUE FAZER:**
- `react-router-dom` (BrowserRouter, Routes, Route, Navigate)
- ProtectedRoute component

---

## 📦 MÓDULO 2: COMUM (Common Components)
**Prioridade:** 🟡 ALTA | **Tempo Estimado:** 1-2 dias

### 2.1. Layout Components

#### 2.1.1. Header.tsx
**O QUE FAZER:**
- Barra superior com logo, título, menu de usuário

**COMO FAZER:**
- Mostrar nome do usuário
- Dropdown com: Perfil, Configurações, Logout
- Responsive (menu hamburguer em mobile)

**COM O QUE FAZER:**
- `@headlessui/react` Menu component
- `lucide-react` icons
- `useAuth` hook

#### 2.1.2. Sidebar.tsx
**O QUE FAZER:**
- Menu lateral com navegação principal

**COMO FAZER:**
- Links: Dashboard, Receitas, Despesas, Metas, Categorias, Parâmetros
- Highlight do item ativo
- Collapsible em mobile

**COM O QUE FAZER:**
- `react-router-dom` NavLink
- `framer-motion` para animações
- `lucide-react` icons

#### 2.1.3. Footer.tsx
**O QUE FAZER:**
- Rodapé simples com informações

**COMO FAZER:**
- Copyright, versão, links úteis

**COM O QUE FAZER:**
- Tailwind CSS

### 2.2. Feedback Components

#### 2.2.1. Loading.tsx
**O QUE FAZER:**
- Componente de carregamento reutilizável
- Variantes: spinner, skeleton, fullscreen

**COMO FAZER:**
- Props: `size`, `variant`, `text`
- Animação suave

**COM O QUE FAZER:**
- `framer-motion`
- Tailwind CSS

#### 2.2.2. ErrorMessage.tsx
**O QUE FAZER:**
- Exibir mensagens de erro amigáveis

**COMO FAZER:**
- Props: `error`, `retry callback`, `onClose`
- Diferentes níveis: error, warning, info

**COM O QUE FAZER:**
- `lucide-react` icons
- Tailwind CSS

### 2.3. UI Components

#### 2.3.1. Modal.tsx
**O QUE FAZER:**
- Modal genérico reutilizável

**COMO FAZER:**
- Props: `isOpen`, `onClose`, `title`, `children`, `footer`
- Fechar com ESC e click fora
- Animação de entrada/saída

**COM O QUE FAZER:**
- `@headlessui/react` Dialog
- `framer-motion`

#### 2.3.2. Pagination.tsx
**O QUE FAZER:**
- Componente de paginação

**COMO FAZER:**
- Props: `currentPage`, `totalPages`, `onPageChange`
- Mostrar: Previous, números de página, Next
- Limite de páginas visíveis (ex: 5)

**COM O QUE FAZER:**
- Tailwind CSS
- `lucide-react` icons (ChevronLeft, ChevronRight)

---

## 📦 MÓDULO 3: DASHBOARD
**Prioridade:** 🟡 ALTA | **Tempo Estimado:** 2-3 dias

### 3.1. Service
**Arquivo:** `src/services/dashboardService.ts`

**O QUE FAZER:**
- Buscar dados consolidados do DashboardController
- Endpoints esperados: `/api/dashboard/resumo`, `/api/dashboard/graficos`

**COMO FAZER:**
```typescript
- getResumoFinanceiro(mes?: number, ano?: number): Promise<ResumoDTO>
- getDadosGraficos(periodo: string): Promise<GraficoDTO[]>
- getComparativoMensal(meses: number): Promise<ComparativoDTO>
```

**COM O QUE FAZER:**
- Axios API instance
- Types para DTOs de resposta

### 3.2. Hook
**Arquivo:** `src/hooks/useDashboard.ts`

**O QUE FAZER:**
- Encapsular lógica de fetching do dashboard

**COMO FAZER:**
- Usar React Query para cache e revalidação
- Retornar: `data`, `isLoading`, `error`, `refetch`

**COM O QUE FAZER:**
- `@tanstack/react-query`
- dashboardService

### 3.3. Componentes

#### 3.3.1. Dashboard.tsx (Container Principal)
**O QUE FAZER:**
- Layout principal do dashboard
- Orquestrar sub-componentes

**COMO FAZER:**
- Grid responsivo com cards
- Filtros de período (mês/ano)
- Loading e error states

**COM O QUE FAZER:**
- `useDashboard` hook
- Sub-componentes de dashboard
- Tailwind Grid

#### 3.3.2. ResumoFinanceiro.tsx
**O QUE FAZER:**
- Cards com resumo: Total Receitas, Total Despesas, Saldo, Meta Progress

**COMO FAZER:**
- 4 cards com ícones e valores formatados
- Cores diferentes por tipo (verde receitas, vermelho despesas)
- Indicadores de variação (↑↓)

**COM O QUE FAZER:**
- `currencyFormatter` util (criar)
- `lucide-react` icons
- Tailwind CSS

#### 3.3.3. GraficoReceitas.tsx
**O QUE FAZER:**
- Gráfico de receitas por categoria/período

**COMO FAZER:**
- Gráfico de barras ou pizza
- Tooltip com valores detalhados
- Responsivo

**COM O QUE FAZER:**
- `recharts` (já instalado)
- Types para dados do gráfico

#### 3.3.4. GraficoDespesas.tsx
**O QUE FAZER:**
- Gráfico de despesas por categoria

**COMO FAZER:**
- Similar ao GraficoReceitas
- Destaque para categorias com maior gasto

**COM O QUE FAZER:**
- `recharts`
- Palette de cores do Tailwind

#### 3.3.5. MetasWidget.tsx
**O QUE FAZER:**
- Widget com progresso das metas

**COMO FAZER:**
- Lista de metas ativas
- Progress bar para cada meta
- Link para página de metas

**COM O QUE FAZER:**
- Progress bar component (criar)
- `react-router-dom` Link

#### 3.3.6. ComparativoMensal.tsx
**O QUE FAZER:**
- Gráfico comparativo dos últimos meses

**COMO FAZER:**
- Gráfico de linhas (receitas vs despesas)
- Eixo X: meses, Eixo Y: valores

**COM O QUE FAZER:**
- `recharts` LineChart
- `date-fns` para formatação de datas

### 3.4. Utils
**Arquivo:** `src/utils/currencyFormatter.ts`

**O QUE FAZER:**
- Formatar valores monetários

**COMO FAZER:**
```typescript
- formatCurrency(value: number, currency = 'BRL'): string
- parseCurrency(formatted: string): number
```

**COM O QUE FAZER:**
- Intl.NumberFormat API

**Arquivo:** `src/utils/dateFormatter.ts`

**O QUE FAZER:**
- Formatar datas

**COMO FAZER:**
```typescript
- formatDate(date: Date | string, format: string): string
- parseDate(dateString: string): Date
- getMonthName(month: number): string
```

**COM O QUE FAZER:**
- `date-fns` (já instalado)

---

## 📦 MÓDULO 4: CATEGORIAS
**Prioridade:** 🟡 ALTA | **Tempo Estimado:** 1 dia

### 4.1. Service
**Arquivo:** `src/services/categoriaService.ts`

**O QUE FAZER:**
- CRUD de categorias
- Endpoints: `/api/categorias` (GET, POST, PUT, DELETE)

**COMO FAZER:**
```typescript
- getCategorias(tipo?: 'RECEITA' | 'DESPESA'): Promise<Categoria[]>
- getCategoria(id: number): Promise<Categoria>
- createCategoria(data: CategoriaDTO): Promise<Categoria>
- updateCategoria(id: number, data: CategoriaDTO): Promise<Categoria>
- deleteCategoria(id: number): Promise<void>
```

**COM O QUE FAZER:**
- Axios API
- Types: `Categoria`, `CategoriaDTO`

### 4.2. Store (Opcional)
**Arquivo:** `src/store/categoriaStore.ts`

**O QUE FAZER:**
- Cache local de categorias (para selects em outros formulários)

**COMO FAZER:**
- Store simples com lista de categorias
- Actions: `setCategorias`, `addCategoria`, `updateCategoria`, `removeCategoria`

**COM O QUE FAZER:**
- Zustand

### 4.3. Componentes

#### 4.3.1. CategoriasList.tsx
**O QUE FAZER:**
- Listar todas as categorias
- Filtrar por tipo (Receita/Despesa)
- Ações: editar, excluir

**COMO FAZER:**
- Tabela responsiva ou cards
- Botão "Nova Categoria"
- Confirmação antes de excluir

**COM O QUE FAZER:**
- React Query para fetch
- Modal de confirmação
- CategoriaForm

#### 4.3.2. CategoriaForm.tsx
**O QUE FAZER:**
- Formulário para criar/editar categoria
- Campos: nome, tipo (RECEITA/DESPESA), cor, ícone

**COMO FAZER:**
- Modal ou página separada
- Validação: nome obrigatório, tipo obrigatório
- Seletor de cor e ícone

**COM O QUE FAZER:**
- react-hook-form + zod
- Color picker (pode ser input color HTML5)
- Icon picker (grid de ícones do lucide-react)

---

## 📦 MÓDULO 5: RECEITAS
**Prioridade:** 🟢 MÉDIA | **Tempo Estimado:** 2 dias

### 5.1. Service
**Arquivo:** `src/services/receitaService.ts`

**O QUE FAZER:**
- CRUD de receitas com paginação e filtros
- Endpoints: `/api/receitas` (GET, POST, PUT, DELETE)

**COMO FAZER:**
```typescript
- getReceitas(params: ReceitaParams): Promise<PagedResponse<Receita>>
- getReceita(id: number): Promise<Receita>
- createReceita(data: ReceitaDTO): Promise<Receita>
- updateReceita(id: number, data: ReceitaDTO): Promise<Receita>
- deleteReceita(id: number): Promise<void>
```

**COM O QUE FAZER:**
- Axios API
- Types: `Receita`, `ReceitaDTO`, `ReceitaParams`, `PagedResponse`

### 5.2. Hook
**Arquivo:** `src/hooks/useReceitas.ts`

**O QUE FAZER:**
- Gerenciar estado de receitas com React Query

**COMO FAZER:**
- Query para listagem com paginação
- Mutations para CRUD
- Invalidação de cache após mutations

**COM O QUE FAZER:**
- `@tanstack/react-query`
- receitaService

### 5.3. Componentes

#### 5.3.1. ReceitasList.tsx
**O QUE FAZER:**
- Listagem paginada de receitas
- Filtros: período, categoria, status
- Ações por item: ver detalhes, editar, excluir

**COMO FAZER:**
- Tabela com colunas: data, descrição, categoria, valor, ações
- Barra de filtros no topo
- Paginação no rodapé

**COM O QUE FAZER:**
- `useReceitas` hook
- Pagination component
- Filters component (pode criar inline)

#### 5.3.2. ReceitaForm.tsx
**O QUE FAZER:**
- Formulário para criar/editar receita
- Campos: descrição, valor, data, categoria, recorrente, observações

**COMO FAZER:**
- Modal ou drawer lateral
- Validações: todos campos obrigatórios exceto observações
- Se recorrente, mostrar campos de frequência
- Formatação automática de valor (currency mask)

**COM O QUE FAZER:**
- react-hook-form + zod
- Select de categorias (buscar do categoriaStore)
- Date picker (input type="date" ou library)
- Currency input mask

#### 5.3.3. ReceitaDetail.tsx
**O QUE FAZER:**
- Visualização detalhada de uma receita
- Histórico de alterações (se houver)

**COMO FAZER:**
- Modal ou página separada
- Todos os dados formatados
- Botões: editar, excluir, voltar

**COM O QUE FAZER:**
- receitaService.getReceita
- Formatters (currency, date)

---

## 📦 MÓDULO 6: DESPESAS
**Prioridade:** 🟢 MÉDIA | **Tempo Estimado:** 2 dias

### 6.1. Service
**Arquivo:** `src/services/despesaService.ts`

**O QUE FAZER:**
- CRUD de despesas (similar a receitas)
- Endpoints: `/api/despesas`

**COMO FAZER:**
- Mesma estrutura de receitaService
- Adicionar: `getDespesasPorCategoria()`, `getTotalPorPeriodo()`

**COM O QUE FAZER:**
- Axios API
- Types: `Despesa`, `DespesaDTO`, `DespesaParams`

### 6.2. Hook
**Arquivo:** `src/hooks/useDespesas.ts`

**O QUE FAZER:**
- Hook similar ao useReceitas

**COMO FAZER:**
- Queries e mutations
- Filtros adicionais: apenas pendentes, apenas pagas

**COM O QUE FAZER:**
- `@tanstack/react-query`
- despesaService

### 6.3. Componentes

#### 6.3.1. DespesasList.tsx
**O QUE FAZER:**
- Listagem de despesas (similar a ReceitasList)
- Indicador visual de status (paga/pendente)

**COMO FAZER:**
- Badge de status com cores (verde=paga, amarelo=pendente)
- Filtro adicional por status

**COM O QUE FAZER:**
- `useDespesas` hook
- Pagination

#### 6.3.2. DespesaForm.tsx
**O QUE FAZER:**
- Formulário de despesa
- Campos adicionais: data vencimento, data pagamento, status

**COMO FAZER:**
- Similar a ReceitaForm
- Campo status: select (PENDENTE, PAGA, ATRASADA)
- Validação: se status=PAGA, data pagamento obrigatória

**COM O QUE FAZER:**
- react-hook-form + zod com validações condicionais

#### 6.3.3. DespesaDetail.tsx
**O QUE FAZER:**
- Detalhes da despesa
- Botão "Marcar como Paga" se pendente

**COMO FAZER:**
- Modal/página de detalhes
- Action button para mudar status

**COM O QUE FAZER:**
- despesaService
- useDespesas mutation

#### 6.3.4. DespesaFilters.tsx
**O QUE FAZER:**
- Componente de filtros reutilizável

**COMO FAZER:**
- Filtros: período, categoria, status, valor (min/max)
- Botão limpar filtros

**COM O QUE FAZER:**
- react-hook-form (uncontrolled)
- Date pickers

---

## 📦 MÓDULO 7: METAS
**Prioridade:** 🔵 BAIXA | **Tempo Estimado:** 2-3 dias

### 7.1. Service
**Arquivo:** `src/services/metaService.ts`

**O QUE FAZER:**
- CRUD de metas
- Gerenciar aportes em metas
- Endpoints: `/api/metas`, `/api/metas/{id}/aportes`

**COMO FAZER:**
```typescript
- getMetas(params?: MetaParams): Promise<Meta[]>
- getMeta(id: number): Promise<Meta>
- createMeta(data: MetaDTO): Promise<Meta>
- updateMeta(id: number, data: MetaDTO): Promise<Meta>
- deleteMeta(id: number): Promise<void>
- addAporte(metaId: number, aporte: AporteDTO): Promise<Meta>
- getAportes(metaId: number): Promise<Aporte[]>
```

**COM O QUE FAZER:**
- Axios API
- Types: `Meta`, `MetaDTO`, `Aporte`, `AporteDTO`

### 7.2. Hook
**Arquivo:** `src/hooks/useMetas.ts`

**O QUE FAZER:**
- Gerenciar metas e aportes

**COMO FAZER:**
- Queries separadas: metas, meta individual, aportes
- Mutations: CRUD meta, adicionar aporte
- Calcular percentual de progresso

**COM O QUE FAZER:**
- `@tanstack/react-query`
- metaService

### 7.3. Componentes

#### 7.3.1. MetasList.tsx
**O QUE FAZER:**
- Listar metas com progress bar
- Filtros: ativas, concluídas, todas
- Cards com: nome, valor alvo, valor atual, prazo, progresso

**COMO FAZER:**
- Grid de cards responsivo
- Progress bar visual por meta
- Cores: verde se >=75%, amarelo 50-74%, vermelho <50%

**COM O QUE FAZER:**
- `useMetas` hook
- MetaProgressBar component

#### 7.3.2. MetaForm.tsx
**O QUE FAZER:**
- Formulário de meta
- Campos: nome, descrição, valor alvo, prazo, categoria

**COMO FAZER:**
- Validação: valor > 0, prazo futuro
- Preview do progresso

**COM O QUE FAZER:**
- react-hook-form + zod
- Date picker

#### 7.3.3. MetaDetail.tsx
**O QUE FAZER:**
- Detalhes completos da meta
- Histórico de aportes
- Gráfico de evolução

**COMO FAZER:**
- Progress bar grande
- Tabela de aportes (data, valor)
- Gráfico de linha com evolução ao longo do tempo
- Botão "Adicionar Aporte"

**COM O QUE FAZER:**
- `useMetas` hook
- `recharts` para gráfico
- AporteForm (modal)

#### 7.3.4. MetaProgressBar.tsx
**O QUE FAZER:**
- Componente de barra de progresso reutilizável

**COMO FAZER:**
- Props: `current`, `target`, `showPercentage`, `size`
- Animação de preenchimento

**COM O QUE FAZER:**
- Tailwind CSS
- `framer-motion` para animação

#### 7.3.5. AporteForm.tsx
**O QUE FAZER:**
- Modal para adicionar aporte
- Campos: valor, data, observações

**COMO FAZER:**
- Validação: valor > 0
- Mostrar quanto falta para a meta

**COM O QUE FAZER:**
- react-hook-form + zod
- Modal component

---

## 📦 MÓDULO 8: PARÂMETROS
**Prioridade:** 🔵 BAIXA | **Tempo Estimado:** 1 dia

### 8.1. Service
**Arquivo:** `src/services/parametroService.ts`

**O QUE FAZER:**
- CRUD de parâmetros do sistema
- Endpoints: `/api/parametros`

**COMO FAZER:**
```typescript
- getParametros(): Promise<Parametro[]>
- getParametro(chave: string): Promise<Parametro>
- updateParametro(chave: string, valor: string): Promise<Parametro>
```

**COM O QUE FAZER:**
- Axios API
- Types: `Parametro` (chave, valor, descricao, tipo)

### 8.2. Componentes

#### 8.2.1. ParametrosList.tsx
**O QUE FAZER:**
- Listar parâmetros configuráveis
- Inline editing ou botão editar

**COMO FAZER:**
- Tabela com: chave, descrição, valor, ações
- Agrupar por categoria se houver

**COM O QUE FAZER:**
- React Query
- parametroService

#### 8.2.2. ParametroForm.tsx
**O QUE FAZER:**
- Formulário para editar parâmetro
- Tipos diferentes de input conforme tipo do parâmetro

**COMO FAZER:**
- Se tipo=BOOLEAN, mostrar toggle
- Se tipo=NUMBER, mostrar input number
- Se tipo=TEXT, mostrar input text
- Se tipo=SELECT, mostrar select com opções

**COM O QUE FAZER:**
- react-hook-form
- Conditional rendering

---

## 📦 MÓDULO 9: USUÁRIO
**Prioridade:** 🔵 BAIXA | **Tempo Estimado:** 1 dia

### 9.1. Service
**Arquivo:** `src/services/usuarioService.ts`

**O QUE FAZER:**
- Gerenciar perfil e usuários (se admin)
- Endpoints: `/api/usuarios`

**COMO FAZER:**
```typescript
- getUsuarios(): Promise<Usuario[]> // admin only
- getUsuario(id: number): Promise<Usuario>
- updateUsuario(id: number, data: UsuarioDTO): Promise<Usuario>
- updateSenha(oldPassword: string, newPassword: string): Promise<void>
- deleteUsuario(id: number): Promise<void> // admin only
```

**COM O QUE FAZER:**
- Axios API
- Types: `Usuario`, `UsuarioDTO`

### 9.2. Componentes
(Já tem ProfilePage.tsx em Auth, pode estender)

---

## 🗂️ ESTRUTURA DE TYPES (TypeScript)
**Arquivo:** `src/types/index.ts` (ou separar por módulo)

**O QUE FAZER:**
- Centralizar todas as interfaces e types

**COMO FAZER:**
```typescript
// Auth
export interface User { id, nome, email, role, ... }
export interface LoginDTO { email, password }
export interface AuthResponse { token, user }

// Categoria
export interface Categoria { id, nome, tipo, cor, icone }

// Receita
export interface Receita { id, descricao, valor, data, categoria, ... }

// Despesa (similar)

// Meta
export interface Meta { id, nome, valorAlvo, valorAtual, prazo, ... }

// Aporte
export interface Aporte { id, valor, data, metaId }

// Dashboard
export interface ResumoDTO { totalReceitas, totalDespesas, saldo, ... }

// Pagination
export interface PagedResponse<T> { content: T[], totalElements, totalPages, ... }
```

---

## 🎨 ESTILO E UI
**O QUE FAZER:**
- Manter consistência visual com Tailwind

**COMO FAZER:**
- Criar componentes base reutilizáveis: Button, Input, Select, Card
- Usar paleta de cores definida no tailwind.config
- Seguir pattern de spacing e typography

**COM O QUE FAZER:**
- Tailwind CSS + @tailwindcss/forms
- Criar arquivo `src/components/ui/` com components básicos

---

## 🧪 VALIDAÇÕES (Zod Schemas)
**Arquivo:** `src/utils/validators.ts`

**O QUE FAZER:**
- Centralizar schemas Zod

**COMO FAZER:**
```typescript
export const loginSchema = z.object({...})
export const receitaSchema = z.object({...})
export const despesaSchema = z.object({...})
...
```

**COM O QUE FAZER:**
- Zod (já instalado)

---

## 📱 RESPONSIVIDADE
**O QUE FAZER:**
- Garantir que todas as telas funcionem em mobile, tablet e desktop

**COMO FAZER:**
- Usar breakpoints do Tailwind: sm, md, lg, xl
- Tabelas viram cards em mobile
- Sidebar colapsa em mobile

---

## ⚡ PERFORMANCE
**O QUE FAZER:**
- Otimizar renderizações e requests

**COMO FAZER:**
- React Query com cache strategy adequada
- Lazy loading de rotas: `React.lazy(() => import(...))`
- Memoização com `React.memo` onde necessário
- Debounce em filtros e buscas

**COM O QUE FAZER:**
- React Query (staleTime, cacheTime)
- React.lazy e Suspense
- lodash debounce ou criar custom hook

---

## 🔧 CONFIGURAÇÕES FINAIS

### .env
```bash
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Sistema Financeiro
```

### Melhorias no vite.config.ts
- Já está OK, apenas verificar proxy se necessário

### React Query Config
**Arquivo:** `src/main.tsx`

**O QUE FAZER:**
- Configurar QueryClient com defaults

**COMO FAZER:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      retry: 1,
    },
  },
})
```

---

## 📋 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. ✅ **FASE 1 - Fundação (3-4 dias)**
   - Types básicos
   - Utils (formatters, tokenManager, validators)
   - Store Auth
   - Service Auth
   - Hook useAuth
   - Components Common (Loading, ErrorMessage, Modal)
   - Components Auth (LoginForm, RegisterForm)
   - ProtectedRoute
   - Rotas básicas

2. ✅ **FASE 2 - Layout (2 dias)**
   - Header
   - Sidebar
   - Footer
   - Layout principal

3. ✅ **FASE 3 - Categorias (1 dia)**
   - Service e Store
   - Components (List, Form)

4. ✅ **FASE 4 - Dashboard (2-3 dias)**
   - Service
   - Hook
   - Todos os componentes de dashboard
   - Gráficos

5. ✅ **FASE 5 - Receitas (2 dias)**
   - Service completo
   - Hook
   - Components (List, Form, Detail)

6. ✅ **FASE 6 - Despesas (2 dias)**
   - Service completo
   - Hook
   - Components (List, Form, Detail, Filters)

7. ✅ **FASE 7 - Metas (2-3 dias)**
   - Service completo
   - Hook
   - Components (List, Form, Detail, ProgressBar, AporteForm)

8. ✅ **FASE 8 - Parâmetros (1 dia)**
   - Service
   - Components (List, Form)

9. ✅ **FASE 9 - Usuário (1 dia)**
   - Service
   - ProfilePage aprimorado

10. ✅ **FASE 10 - Polimento (2-3 dias)**
    - Testes de integração
    - Responsividade
    - Animações
    - Tratamento de erros
    - Loading states
    - Documentação

---

## 📚 RECURSOS E DOCUMENTAÇÃO

**Consultar:**
- Tailwind CSS Docs
- React Hook Form Docs
- Zod Docs
- React Query Docs
- Recharts Examples
- Headless UI Docs

---

## ✨ BOAS PRÁTICAS

1. **Commit semântico**: feat, fix, refactor, style, docs
2. **Componentes pequenos**: uma responsabilidade por componente
3. **DRY**: evitar duplicação de código
4. **Types everywhere**: tipar tudo com TypeScript
5. **Error boundaries**: implementar para capturar erros
6. **Loading states**: sempre mostrar feedback ao usuário
7. **Acessibilidade**: usar labels, aria-*, keyboard navigation
8. **Testes**: considerar adicionar testes com Vitest (já instalado)

---

**TEMPO TOTAL ESTIMADO: 20-25 dias de desenvolvimento**

Esse planejamento é modular e progressivo, permitindo que você implemente e teste cada módulo antes de avançar para o próximo! 🚀