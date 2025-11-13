# 📋 Análise de Melhorias - Services e Controllers Existentes

## 🎯 Visão Geral

Analisando o código atual, identifiquei oportunidades de melhoria em **arquitetura**, **performance**, **segurança**, **manutenibilidade** e **experiência do desenvolvedor**.

---

## 🔧 MELHORIAS NOS SERVICES

### 1. **AuthenticationService** 

#### ⚠️ Problemas Identificados

**Segurança:**
- ❌ Validação de senha muito permissiva (apenas regex)
- ❌ Falta de proteção contra brute force
- ❌ Token refresh sem blacklist/invalidação
- ❌ Sem rate limiting por IP/usuário
- ❌ Falta de auditoria de tentativas de login

**Funcionalidades Ausentes:**
- ❌ Verificação de email (2FA básico)
- ❌ Recuperação de senha
- ❌ Bloqueio temporário após N tentativas falhas
- ❌ Histórico de sessões ativas
- ❌ Notificação de login em novo dispositivo

#### ✅ Melhorias Sugeridas

**1.1 Proteção Contra Brute Force**
```
Implementar:
- Contador de tentativas falhas (Redis/Cache)
- Bloqueio progressivo: 3 falhas = 5min, 5 falhas = 30min, 10 falhas = 24h
- CAPTCHA após 2 tentativas falhas
- Alerta ao usuário após 5 tentativas
- Log de IPs suspeitos
```

**1.2 Token Management Avançado**
```
Criar nova entidade: RefreshToken
Campos:
- id, token_hash, usuario_id, expira_em
- dispositivo, ip_address, user_agent
- ativo, revogado_em, ultimo_uso

Funcionalidades:
- Blacklist de tokens revogados
- Limite de sessões simultâneas (ex: 5 dispositivos)
- Revogação de token por dispositivo
- Rotação automática de refresh token
```

**1.3 Auditoria de Autenticação**
```
Nova entidade: LogAutenticacao
Campos:
- id, usuario_id, acao (LOGIN, LOGOUT, FALHA, REFRESH)
- ip_address, user_agent, localizacao_estimada
- sucesso, motivo_falha, data_hora

Endpoints admin:
- GET /auth/logs/{usuarioId} - Histórico de acessos
- GET /auth/sessoes-ativas - Sessões ativas
- DELETE /auth/sessoes/{id} - Revogar sessão específica
```

**1.4 Recuperação de Senha**
```
Nova entidade: TokenRecuperacao
Campos:
- id, usuario_id, token, expira_em (30min)
- usado, usado_em, ip_criacao

Endpoints:
- POST /auth/esqueci-senha (email) → Envia link
- POST /auth/resetar-senha (token, novaSenha)
- GET /auth/validar-token/{token}

Validações:
- Token único por usuário (invalida anteriores)
- Expiração de 30 minutos
- 1 uso apenas
- Rate limit: 3 solicitações/hora por email
```

**1.5 Verificação de Email**
```
Nova entidade: TokenVerificacao
Campos:
- id, usuario_id, token, expira_em (24h)
- verificado_em

Adicionar em Usuario:
- email_verificado (Boolean)
- verificado_em (LocalDateTime)

Fluxo:
1. Registro → Cria token → Envia email
2. Link: /auth/verificar-email/{token}
3. Bloqueia certas ações se não verificado
```

---

### 2. **CategoriaService**

#### ⚠️ Problemas Identificados

**Performance:**
- ❌ Múltiplas queries para mesma validação
- ❌ N+1 queries em alguns métodos
- ❌ Cache muito abrangente (invalidação desnecessária)

**Funcionalidades:**
- ❌ Falta ordenação customizável
- ❌ Sem importação/exportação em lote
- ❌ Falta de categorias padrão do sistema
- ❌ Sem hierarquia de categorias (pai/filho)

#### ✅ Melhorias Sugeridas

**2.1 Categorias Hierárquicas**
```
Adicionar em Categoria:
- categoria_pai_id (self-reference)
- nivel (Integer) - Profundidade
- caminho_completo (String) - "Alimentação > Restaurantes"
- ordem_exibicao (Integer)

Métodos novos:
- findSubcategorias(Long categoriaId)
- findCategoriasPai()
- moverCategoria(Long id, Long novoIdPai)
- reordenar(List<OrdenacaoDTO>)

Validações:
- Máximo 3 níveis de profundidade
- Não permitir ciclos
- Desativar em cascata (pai desativa filhos)
```

**2.2 Categorias Padrão do Sistema**
```
Adicionar em Categoria:
- sistema (Boolean) - Indica se é categoria padrão
- editavel (Boolean) - Se usuário pode editar

Criar durante primeiro acesso:
- Alimentação, Transporte, Saúde, etc.
- Vincular ao usuário mas marcar como sistema
- Permitir desativar mas não deletar
- Usuário pode criar suas próprias

Método:
- criarCategoriasPadrao(Usuario usuario)
```

**2.3 Importação/Exportação**
```
Novos endpoints:
- POST /categorias/importar
  - Upload CSV/Excel
  - Validar formato
  - Criar em lote
  - Retornar relatório (criadas/erros)

- GET /categorias/exportar?formato=CSV|EXCEL|JSON
  - Exportar todas categorias
  - Incluir subcategorias
  - Metadados (quantidade despesas, última uso)

- POST /categorias/duplicar/{id}
  - Copia categoria com configurações
  - Útil para replicar entre usuários (admin)
```

**2.4 Otimização de Cache**
```
Estratégia atual: Invalida tudo
Melhor: Cache granular

Chaves de cache específicas:
- categorias:usuario:{id}:todas
- categorias:usuario:{id}:ativas
- categorias:usuario:{id}:tipo:{RECEITA|DESPESA}
- categoria:{id}

Invalidação seletiva:
- Criar: Invalida apenas listas do usuário
- Atualizar: Invalida categoria específica + listas
- Deletar: Invalida categoria específica + listas
- Ativar/Desativar: Invalida listas ativas + categoria
```

**2.5 Estatísticas Avançadas**
```
Novos métodos:
- getEstatisticas(Long categoriaId):
  - Total gasto histórico
  - Média mensal
  - Mês com maior gasto
  - Últimas 10 despesas
  - Evolução últimos 6 meses
  - Comparação com mês anterior

- getCategoriasSugeridas():
  - IA simples baseada em descrições de despesas
  - Sugere categorias para despesas sem categoria
  - Machine Learning futuro
```

---

### 3. **DespesaService**

#### ⚠️ Problemas Identificados

**Performance:**
- ❌ Paginação manual ineficiente (carrega tudo na memória)
- ❌ Múltiplas queries para mesmo resultado
- ❌ Falta de projeções (DTO direto do banco)

**Funcionalidades:**
- ❌ Sem busca avançada (múltiplos filtros combinados)
- ❌ Falta de duplicação de despesas
- ❌ Sem geração de parcelas automáticas
- ❌ Falta de lembretes de vencimento
- ❌ Sem anexos/comprovantes

#### ✅ Melhorias Sugeridas

**3.1 Paginação Nativa do Banco**
```
PROBLEMA ATUAL:
List<Despesa> despesas = repository.findAll(); // Carrega TUDO
// Depois pagina em memória

SOLUÇÃO:
Page<Despesa> despesas = repository.findByUsuarioId(usuarioId, pageable);
// Banco já retorna paginado

Vantagens:
- Não carrega todos os registros
- Query otimizada com LIMIT/OFFSET
- Melhor para grandes volumes
```

**3.2 Busca Avançada com Specification**
```
Criar classe: DespesaSpecification

Filtros combinados:
- Categoria (múltiplas)
- Período (data inicial/final)
- Status (múltiplos)
- Valor (min/max)
- Descrição (like)
- Receita
- Parcelado (sim/não)
- Tags (futuro)

Endpoint:
POST /despesas/buscar
Body: DespesaFiltroDTO

Exemplo query dinâmica:
WHERE categoria IN (...)
  AND data BETWEEN ? AND ?
  AND status IN (...)
  AND valor >= ? AND valor <= ?
  AND descricao LIKE ?
```

**3.3 Geração Automática de Parcelas**
```
Método: criarDespesaParcelada(DespesaParceladaDTO)

Parâmetros:
- Valor total
- Número de parcelas
- Data primeira parcela
- Categoria, Receita, etc.

Lógica:
1. Calcula valor de cada parcela
2. Cria N despesas com:
   - parcelaAtual = 1, 2, 3...N
   - parcelaTotal = N
   - data incrementada mensalmente
   - Vincula todas (despesa_origem_id)

3. Atualização inteligente:
   - Editar parcela_origem → Atualiza todas
   - Editar parcela específica → Quebra vínculo
   - Deletar origem → Deleta todas pendentes

Endpoint:
POST /despesas/parcelada
PUT /despesas/parcelada/{id} (atualiza todas)
DELETE /despesas/parcelada/{id}?todas=true
```

**3.4 Sistema de Lembretes**
```
Nova entidade: LembreteDespesa
Campos:
- id, despesa_id, dias_antes (3, 5, 7)
- enviado, enviado_em
- tipo_notificacao (EMAIL, PUSH, SMS)

Funcionalidades:
- Job agendado (cron) roda todo dia 8h
- Busca despesas vencendo em N dias
- Envia notificação se não enviado
- Marca como enviado

Configuração por usuário (Parametro):
- lembrete_despesas_ativo (true/false)
- lembrete_dias_antes (3)
- lembrete_tipo (EMAIL)

Endpoints:
POST /despesas/{id}/lembretes
GET /despesas/{id}/lembretes
DELETE /lembretes/{id}
```

**3.5 Duplicação de Despesas**
```
Método: duplicar(Long id, DuplicacaoDTO)

Opções:
- Manter mesma data ou escolher nova
- Manter status ou resetar para PENDENTE
- Copiar observações
- Copiar categoria e receita
- Criar série (ex: duplicar para próximos 12 meses)

Casos de uso:
- Despesas fixas mensais (aluguel)
- Repetir compra anterior
- Modelo para novas despesas

Endpoint:
POST /despesas/{id}/duplicar
POST /despesas/{id}/duplicar-serie (múltiplas)
```

**3.6 Projeções/DTOs do Banco**
```
PROBLEMA: SELECT * carrega tudo, depois mapeia

SOLUÇÃO: Usar projections

Interface DespesaResumoProjection:
- Long getId()
- String getDescricao()
- BigDecimal getValor()
- LocalDate getData()
- String getCategoriaNome()
- StatusPagamento getStatus()

Repository:
@Query("SELECT d.id as id, d.descricao as descricao, ... 
        FROM Despesa d WHERE ...")
List<DespesaResumoProjection> findResumo(...)

Controller:
Page<DespesaResumoDTO> // Já vem otimizado do banco
```

**3.7 Estatísticas por Categoria**
```
Método: getEstatisticasPorCategoria(filtros)

Retorna:
- Categoria
- Quantidade despesas
- Valor total
- Valor médio
- % do total geral
- Evolução vs mês anterior

Endpoint:
GET /despesas/estatisticas/categorias?inicio=X&fim=Y
```

---

### 4. **MetaService**

#### ⚠️ Problemas Identificados

**Funcionalidades:**
- ❌ Falta de simulações/projeções
- ❌ Sem aporte automático recorrente
- ❌ Falta de alertas de progresso
- ❌ Sem vincular despesas a metas
- ❌ Falta de sugestões inteligentes

#### ✅ Melhorias Sugeridas

**4.1 Simulador de Metas**
```
Método: simular(SimulacaoMetaDTO)

Entrada:
- Valor objetivo
- Prazo (meses)
- Aporte mensal planejado
- Taxa rendimento (opcional)

Saída:
- Atingirá objetivo? (Sim/Não)
- Falta/Sobra (R$)
- Aporte necessário para atingir
- Tempo estimado
- Projeção mês a mês

Endpoint:
POST /metas/simular
```

**4.2 Aportes Recorrentes Automáticos**
```
Nova entidade: AporteRecorrente
Campos:
- id, meta_id, valor_fixo
- dia_do_mes (5, 15, 30)
- ativo, proximo_aporte
- tipo (FIXO, PERCENTUAL_SALARIO)

Job agendado:
- Roda todo dia verificando aportes devidos
- Cria TransacaoMeta automaticamente
- Notifica usuário
- Atualiza próximo_aporte

Configurações:
- Pausar/Retomar
- Alterar valor
- Histórico de aportes automáticos

Endpoints:
POST /metas/{id}/aportes-recorrentes
PUT /aportes-recorrentes/{id}
DELETE /aportes-recorrentes/{id}
GET /metas/{id}/aportes-recorrentes
```

**4.3 Vinculação Despesa → Meta**
```
Cenário: Economizar para viagem

1. Criar meta "Viagem Europa - R$ 15.000"

2. Vincular despesas que CONTRIBUEM:
   - Aporte manual → Meta
   - Cashback de compras → Meta
   - Dinheiro economizado em contas → Meta

3. Vincular despesas que ATRAPALHAM:
   - Gastos extras → Deduz progresso
   - "Vazamentos" financeiros

Campos em Despesa:
- meta_relacionada_id
- impacto_meta (POSITIVO, NEGATIVO)

Dashboard meta:
- Aportes diretos: R$ 5.000
- Despesas contribuindo: R$ 2.000
- Despesas prejudicando: -R$ 800
- Saldo real: R$ 6.200
```

**4.4 Alertas de Progresso**
```
Sistema de notificações:
- 25% atingido → "Parabéns! 1/4 do caminho"
- 50% atingido → "Metade da jornada!"
- 75% atingido → "Quase lá! Faltam 25%"
- 90% atingido → "Reta final!"
- 100% atingido → "🎉 Meta concluída!"

Alertas de risco:
- Prazo próximo (30 dias) e < 70% → "Acelere aportes"
- Sem aportes há 30 dias → "Não esqueça sua meta"
- Resgate recente → "Cuidado com resgates"

Configurável por usuário (Parametro):
- alertas_metas_ativo
- alertas_tipo (EMAIL, PUSH)
```

**4.5 Sugestões Inteligentes**
```
IA Simples baseada em dados:

Sugestões de aporte:
"Você gastou R$ 200 a menos este mês em Alimentação.
Que tal aportar em sua meta 'Casa Própria'?"

Sugestões de economia:
"Reduzindo R$ 50/mês em Streaming, você atinge sua
meta 3 meses mais cedo!"

Análise de viabilidade:
"Sua renda atual não suporta esta meta no prazo.
Sugestões:
1. Aumentar prazo para 24 meses
2. Reduzir objetivo para R$ 8.000
3. Aumentar aporte mensal em R$ 150"

Endpoint:
GET /metas/{id}/sugestoes
POST /metas/analisar-viabilidade
```

**4.6 Marcos (Milestones)**
```
Nova entidade: MarcoMeta
Campos:
- id, meta_id, percentual (25, 50, 75)
- valor_alvo, alcancado, data_alcancado
- recompensa (texto motivacional)

Funcionalidades:
- Cria automaticamente 25%, 50%, 75%, 100%
- Usuário pode criar marcos custom
- Notifica quando atinge
- Timeline visual de progresso

Endpoint:
GET /metas/{id}/marcos
POST /metas/{id}/marcos (custom)
```

---

### 5. **DashboardService**

#### ⚠️ Problemas Identificados

**Performance:**
- ❌ Múltiplas queries para mesmo dashboard
- ❌ Cache muito genérico
- ❌ Cálculos complexos em runtime

**Funcionalidades:**
- ❌ Falta de insights/recomendações
- ❌ Sem comparação com períodos anteriores
- ❌ Falta de alertas financeiros
- ❌ Sem previsões/tendências

#### ✅ Melhorias Sugeridas

**5.1 Query Consolidada Única**
```
PROBLEMA: 15+ queries para montar dashboard

SOLUÇÃO: View materializada ou CTE complexa

CREATE VIEW dashboard_consolidado AS
SELECT 
  u.id as usuario_id,
  EXTRACT(MONTH FROM d.data) as mes,
  EXTRACT(YEAR FROM d.data) as ano,
  SUM(CASE WHEN tipo='RECEITA' THEN valor ELSE 0 END) as total_receitas,
  SUM(CASE WHEN tipo='DESPESA' AND status='PAGO' THEN valor ELSE 0 END) as total_despesas_pagas,
  ...
FROM usuarios u
LEFT JOIN despesas d ON ...
GROUP BY u.id, mes, ano

Repository:
@Query("SELECT * FROM dashboard_consolidado WHERE usuario_id = ? AND mes = ? AND ano = ?")
DashboardProjection findDashboard(...)

Resultado: 1 query ao invés de 15
```

**5.2 Cache com TTL Diferenciado**
```
Estratégia atual: Cache 5 minutos tudo

Melhor: TTL por tipo de dado

Configuração:
- Saldo atual: 1 minuto (muda rápido)
- Despesas mês: 5 minutos
- Estatísticas gerais: 15 minutos
- Comparativos: 30 minutos
- Histórico: 1 hora (dados antigos)

@Cacheable(
  value = "dashboard-saldo",
  key = "#usuarioId",
  unless = "#result == null"
)
@CacheEvict após criar/atualizar despesa
```

**5.3 Insights Automáticos**
```
Método: getInsights(mes, ano)

Tipos de insights:

📊 Comparativos:
- "Você gastou 15% a mais este mês"
- "Sua categoria mais cara foi Alimentação (R$ 1.200)"
- "Você economizou R$ 300 em relação ao mês passado"

⚠️ Alertas:
- "Atenção! 3 despesas vencidas"
- "Você já gastou 80% da sua receita do mês"
- "Meta 'Viagem' está atrasada"

✅ Conquistas:
- "Parabéns! Primeiro mês com saldo positivo"
- "Você economizou por 3 meses seguidos"
- "Meta concluída: Casa Própria"

💡 Sugestões:
- "Considere reduzir gastos em Lazer"
- "Que tal criar uma meta de emergência?"
- "Seu cashback acumulou R$ 50"

Implementação:
- Análise rule-based (regras simples)
- Machine Learning futuro
- Armazenar insights gerados (não recalcular sempre)

Endpoint:
GET /dashboard/insights?mes=X&ano=Y
```

**5.4 Previsões e Tendências**
```
Método: getPrevisoes(meses)

Análises:

Projeção Próximo Mês:
- Baseado em média últimos 6 meses
- Considera sazonalidade
- Despesas fixas já cadastradas
- Metas com aportes programados

Tendências:
- "Seus gastos estão crescendo 5% ao mês"
- "Você está economizando progressivamente"
- "Padrão: Gastos altos no início do mês"

Alertas Preditivos:
- "No ritmo atual, você ficará negativo em 15 dias"
- "Sua meta não será atingida no prazo"
- "Despesa grande próximo mês (IPVA)"

Gráficos:
- Evolução 12 meses com tendência
- Previsão próximos 3 meses
- Curva de acumulação metas

Endpoint:
GET /dashboard/previsoes?meses=3
GET /dashboard/tendencias
```

**5.5 Comparativos Inteligentes**
```
Método: getComparativoInteligente()

Análises:

Vs Mês Anterior:
- Variação % receitas/despesas
- Categorias que mais aumentaram/diminuíram
- Despesas novas este mês

Vs Mesmo Mês Ano Passado:
- Crescimento anual
- Padrões sazonais
- Inflação pessoal

Vs Média dos Últimos 6 Meses:
- Está acima/abaixo
- Identificar outliers
- Normalizar dados

Vs Meta Orçamento (futuro):
- Orçado vs Realizado por categoria
- % de aderência ao plano
- Onde estourou o orçamento

Endpoint:
GET /dashboard/comparativos
GET /dashboard/sazonalidade
```

**5.6 Dashboard Consolidado Otimizado**
```
ATUAL: Método getDashboard() retorna tudo

MELHOR: Endpoints granulares

GET /dashboard (resumo básico - cache 1min)
- Saldo atual
- Total mês
- Despesas pendentes (count)
- Metas ativas (count)

GET /dashboard/receitas-despesas (cache 5min)
- Detalhamento receitas
- Detalhamento despesas
- Comparativos

GET /dashboard/categorias (cache 15min)
- Top categorias
- Gráfico pizza
- Evolução por categoria

GET /dashboard/metas (cache 5min)
- Status metas
- Progresso
- Aportes recentes

GET /dashboard/insights (cache 30min)
- Alertas
- Sugestões
- Tendências

Vantagens:
- Frontend carrega progressivamente
- Cache mais eficiente
- Menos processamento
- Melhor UX (loading incremental)
```

---

### 6. **ReceitaService & ParametroService**

#### ⚠️ Problemas Identificados

**ReceitaService:**
- ❌ Validação de sobreposição pode falhar
- ❌ Falta de templates de receita
- ❌ Sem vínculo com conta bancária (futuro)
- ❌ Falta de previsão de receitas

**ParametroService:**
- ❌ Sem versionamento de configurações
- ❌ Falta de validação por schema
- ❌ Sem agrupamento lógico
- ❌ Falta de valores padrão globais

#### ✅ Melhorias Sugeridas

**6.1 ReceitaService**

```
Templates de Receita:
- Salvar como modelo reutilizável
- Aplicar template em novos meses
- "Copiar mês anterior"

Previsão de Receitas:
- Calcular média últimos 6 meses
- Considerar sazonalidade (13º, férias)
- Alertar sobre variações atípicas

Múltiplas Fontes:
- Salário CLT
- Freelas
- Investimentos
- Outras rendas

Endpoint:
POST /receitas/template
POST /receitas/aplicar-template/{id}
GET /receitas/previsao/{mes}/{ano}
```

**6.2 ParametroService**

```
Agrupamento Lógico:
- Grupo: NOTIFICACOES
  - email_ativo
  - push_ativo
  - sms_ativo
- Grupo: DASHBOARD
  - modo_exibicao
  - periodo_padrao
- Grupo: PRIVACIDADE
  - perfil_publico
  - compartilhar_dados

Versionamento:
- Histórico de alterações
- Rollback para versão anterior
- Auditoria de quem alterou

Validação por Schema:
- Enum de valores permitidos
- Range para números (min/max)
- Regex para strings
- Dependências entre parâmetros

Endpoint:
GET /parametros/grupos
GET /parametros/historico/{chave}
POST /parametros/rollback/{chave}
```

---

## 📡 MELHORIAS NOS CONTROLLERS

### 1. **Padronização Geral**

#### ⚠️ Problemas Identificados

- ❌ Inconsistência em respostas HTTP
- ❌ Falta de versionamento da API
- ❌ Sem paginação default padronizada
- ❌ Falta de rate limiting
- ❌ Documentação Swagger incompleta

#### ✅ Melhorias Sugeridas

**1.1 Padronização de Respostas**

```
Criar wrapper: ApiResponse<T>

Campos:
- success (boolean)
- data (T)
- message (String)
- timestamp (LocalDateTime)
- path (String)
- errors (List<FieldError>) - Para validações

Exemplos:

Sucesso:
{
  "success": true,
  "data": {...},
  "message": "Operação realizada com sucesso",
  "timestamp": "2024-11-13T10:30:00",
  "path": "/api/v1/despesas"
}

Erro:
{
  "success": false,
  "data": null,
  "message": "Erro de validação",
  "timestamp": "2024-11-13T10:30:00",
  "path": "/api/v1/despesas",
  "errors": [
    {
      "field": "valor",
      "message": "Valor deve ser positivo"
    }
  ]
}

Implementar via @ControllerAdvice
```

**1.2 Versionamento da API**

```
Estratégia: URL Path Versioning

Estrutura:
/api/v1/despesas
/api/v2/despesas (futuro)

Benefícios:
- Breaking changes não afetam clientes antigos
- Suporte a múltiplas versões simultâneas
- Migração gradual

Configuração:
@RequestMapping("/api/v1/despesas")
@ApiVersion("1.0")
public class DespesaController {...}

Depreciação:
@Deprecated(since = "2.0", forRemoval = true)
@ApiVersion("1.0")
```

**1.3 Rate Limiting**

```
Implementar com Bucket4j + Redis

Configuração por endpoint:
- Públicos: 100 req/hora
- Autenticados: 1000 req/hora
- Admin: 5000 req/hora

Especiais:
- Login: 5 req/min
- Registro: 3 req/hora
- Esqueci senha: 3 req/hora

Headers resposta:
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1699889400

Resposta 429 (Too Many Requests):
{
  "success": false,
  "message": "Taxa de requisições excedida",
  "retry_after": 3600
}
```

**1.4 Documentação Swagger Completa**

```
Melhorias necessárias:

@Tag: Descrição detalhada do módulo
@Operation: Summary + Description + Examples
@ApiResponse: Todos códigos possíveis (200, 201, 400, 401, 404, 500)
@Schema: Todos campos dos DTOs documentados
@Parameter: Descrição de cada parâmetro

Exemplo:
@Operation(
  summary = "Criar nova despesa",
  description = "Cria uma nova despesa para o usuário autenticado...",
  responses = {
    @ApiResponse(
      responseCode = "201",
      description = "Despesa criada com sucesso",
      content = @Content(schema = @Schema(implementation = DespesaResponseDTO.class))
    ),
    @ApiResponse(
      responseCode = "400",
      description = "Dados inválidos"
    ),
    @ApiResponse(
      responseCode = "401",
      description = "Não autenticado"
    )
  }
)

Adicionar:
- Exemplos de request/response
- Autenticação necessária
- Permissões requeridas
```

---

### 2. **AuthController**

#### ✅ Melhorias Sugeridas

```
Novos Endpoints:

POST /api/v1/auth/esqueci-senha
Body: { "email": "user@example.com" }
Response: { "message": "Email enviado" }

POST /api/v1/auth/resetar-senha
Body: { "token": "...", "novaSenha": "...", "confirmacao": "..." }
Response: { "message": "Senha alterada" }
expiresIn": "29min" }

POST /api/v1/auth/verificar-email
Body: { "token": "..." }
Response: { "message": "Email verificado com sucesso" }

POST /api/v1/auth/reenviar-verificacao
Body: { "email": "user@example.com" }
Response: { "message": "Email reenviado" }

GET /api/v1/auth/sessoes-ativas
Response: Lista de sessões com dispositivo, IP, último acesso

DELETE /api/v1/auth/sessoes/{id}
Response: 204 No Content

DELETE /api/v1/auth/sessoes/todas
Response: { "message": "Todas sessões encerradas" }

POST /api/v1/auth/validar-token-refresh
Body: { "refreshToken": "..." }
Response: { "valid": true, "expiresIn": "6d 23h" }

Validações adicionais:
- Rate limiting específico para cada endpoint
- CAPTCHA após falhas de login
- Log detalhado de tentativas
```

---

### 3. **DespesaController**

#### ✅ Melhorias Sugeridas

```
Novos Endpoints:

POST /api/v1/despesas/parcelada
Body: {
  "descricao": "Notebook",
  "valorTotal": 3000,
  "numeroParcelas": 10,
  "dataInicio": "2024-12-01",
  "categoriaId": 5
}
Response: Lista de despesas criadas

PUT /api/v1/despesas/parcelada/{id}
Query: ?atualizarTodas=true
Body: { "categoriaId": 6, "observacoes": "..." }
Response: { "atualizadas": 8, "restantes": 2 }

DELETE /api/v1/despesas/parcelada/{id}
Query: ?apenasRestantes=true
Response: { "deletadas": 5, "message": "5 parcelas restantes deletadas" }

POST /api/v1/despesas/{id}/duplicar
Body: {
  "novaData": "2024-12-01",
  "manterStatus": false,
  "quantidade": 1
}
Response: DespesaResponseDTO

POST /api/v1/despesas/{id}/duplicar-serie
Body: {
  "dataInicio": "2024-12-01",
  "quantidade": 12,
  "intervalo": "MENSAL"
}
Response: Lista de despesas criadas

POST /api/v1/despesas/buscar-avancada
Body: {
  "categorias": [1, 2, 3],
  "status": ["PENDENTE", "VENCIDO"],
  "dataInicio": "2024-01-01",
  "dataFim": "2024-12-31",
  "valorMin": 100,
  "valorMax": 1000,
  "descricao": "mercado",
  "parcelado": true,
  "pageable": { "page": 0, "size": 20 }
}
Response: Page<DespesaResponseDTO>

POST /api/v1/despesas/{id}/lembretes
Body: {
  "diasAntes": 3,
  "tipo": "EMAIL",
  "ativo": true
}
Response: LembreteResponseDTO

GET /api/v1/despesas/{id}/lembretes
Response: Lista de lembretes configurados

DELETE /api/v1/despesas/lembretes/{id}
Response: 204 No Content

POST /api/v1/despesas/importar
Content-Type: multipart/form-data
File: despesas.csv
Response: {
  "importadas": 45,
  "erros": 3,
  "detalhes": [...]
}

GET /api/v1/despesas/exportar
Query: ?formato=CSV|EXCEL|PDF&inicio=...&fim=...
Response: File download

GET /api/v1/despesas/estatisticas
Query: ?inicio=...&fim=...&agrupar=CATEGORIA|MES|STATUS
Response: {
  "total": 15000,
  "media": 500,
  "maior": 2000,
  "menor": 50,
  "grupos": [...]
}

PATCH /api/v1/despesas/{id}/categoria
Body: { "categoriaId": 5 }
Response: DespesaResponseDTO

PATCH /api/v1/despesas/lote/status
Body: {
  "despesaIds": [1, 2, 3],
  "novoStatus": "PAGO"
}
Response: { "atualizadas": 3 }

POST /api/v1/despesas/{id}/observacao
Body: { "observacao": "Pagamento aprovado" }
Response: DespesaResponseDTO

Melhorias em endpoints existentes:

GET /api/v1/despesas
- Adicionar filtros query params:
  ?categoria=1&status=PENDENTE&inicio=...&fim=...
- Ordenação: ?sort=data,desc&sort=valor,asc
- Projeção: ?fields=id,descricao,valor (retorna apenas campos especificados)

GET /api/v1/despesas/{id}
- Query: ?incluir=categoria,receita,lembretes
  (controle de dados relacionados carregados)
```

---

### 4. **MetaController**

#### ✅ Melhorias Sugeridas

```
Novos Endpoints:

POST /api/v1/metas/simular
Body: {
  "valorObjetivo": 10000,
  "prazo": 12,
  "aporteMensal": 800,
  "taxaRendimento": 0.5
}
Response: {
  "atingivel": true,
  "sobraOuFalta": 600,
  "aporteNecessario": 750,
  "projecao": [
    { "mes": 1, "valor": 804, "acumulado": 804 },
    { "mes": 2, "valor": 808, "acumulado": 1612 },
    ...
  ]
}

POST /api/v1/metas/{id}/aportes-recorrentes
Body: {
  "valorFixo": 500,
  "diaDoMes": 5,
  "tipo": "FIXO"
}
Response: AporteRecorrenteResponseDTO

GET /api/v1/metas/{id}/aportes-recorrentes
Response: Lista de aportes recorrentes configurados

PUT /api/v1/metas/aportes-recorrentes/{id}
Body: { "valorFixo": 600, "ativo": true }
Response: AporteRecorrenteResponseDTO

PATCH /api/v1/metas/aportes-recorrentes/{id}/pausar
Response: AporteRecorrenteResponseDTO

PATCH /api/v1/metas/aportes-recorrentes/{id}/retomar
Response: AporteRecorrenteResponseDTO

DELETE /api/v1/metas/aportes-recorrentes/{id}
Response: 204 No Content

GET /api/v1/metas/{id}/sugestoes
Response: {
  "aporteRecomendado": 850,
  "economiasPossiveis": [
    {
      "categoria": "Streaming",
      "valorAtual": 150,
      "sugestao": "Reduzir para 100",
      "impacto": "Atingir meta 2 meses mais cedo"
    }
  ],
  "alertas": [
    "Meta inviável no prazo atual",
    "Considere aumentar prazo para 18 meses"
  ]
}

POST /api/v1/metas/analisar-viabilidade
Body: {
  "valorObjetivo": 50000,
  "prazo": 12,
  "rendaMensal": 5000,
  "despesasFixas": 4000
}
Response: {
  "viavel": false,
  "motivosInviabilidade": [...],
  "alternativas": [
    { "tipo": "AUMENTAR_PRAZO", "valor": 24, "descricao": "..." },
    { "tipo": "REDUZIR_OBJETIVO", "valor": 30000, "descricao": "..." }
  ]
}

GET /api/v1/metas/{id}/marcos
Response: Lista de marcos (25%, 50%, 75%, 100%)

POST /api/v1/metas/{id}/marcos
Body: {
  "percentual": 60,
  "descricao": "Marco customizado",
  "recompensa": "Jantar comemorativo"
}
Response: MarcoMetaResponseDTO

GET /api/v1/metas/{id}/timeline
Response: {
  "eventos": [
    {
      "tipo": "CRIACAO",
      "data": "2024-01-01",
      "descricao": "Meta criada"
    },
    {
      "tipo": "APORTE",
      "data": "2024-01-05",
      "valor": 500,
      "descricao": "Aporte de R$ 500"
    },
    {
      "tipo": "MARCO",
      "data": "2024-03-15",
      "descricao": "25% atingido"
    }
  ]
}

GET /api/v1/metas/{id}/progresso-detalhado
Response: {
  "valorObjetivo": 10000,
  "valorAtual": 6500,
  "percentual": 65,
  "valorRestante": 3500,
  "totalAportes": 7000,
  "totalResgates": 500,
  "diasDecorridos": 120,
  "diasRestantes": 60,
  "velocidadeMedia": 54.16,
  "previsaoConclusao": "2024-07-15",
  "statusPrevisao": "NO_PRAZO"
}

POST /api/v1/metas/{id}/vincular-despesa
Body: {
  "despesaId": 123,
  "impacto": "POSITIVO"
}
Response: { "message": "Despesa vinculada" }

GET /api/v1/metas/{id}/despesas-vinculadas
Response: Lista de despesas impactando a meta

GET /api/v1/metas/comparar
Query: ?metas=1,2,3
Response: {
  "comparacao": [
    {
      "metaId": 1,
      "nome": "Viagem",
      "progresso": 65,
      "velocidade": 54,
      "previsao": "2024-07-15"
    },
    ...
  ],
  "maisRapida": 2,
  "maisLenta": 3
}

POST /api/v1/metas/template
Body: {
  "nome": "Fundo Emergência 6 meses",
  "tipo": "ECONOMIA",
  "baseadoEm": "SALARIO_MULTIPLICADO",
  "multiplicador": 6
}
Response: MetaResponseDTO

GET /api/v1/metas/templates
Response: Lista de templates pré-definidos

GET /api/v1/metas/insights
Response: {
  "insights": [
    "Você está economizando 15% acima da média",
    "Meta 'Casa Própria' pode ser atingida 3 meses antes",
    "Considere pausar meta 'Carro' e focar em 'Emergência'"
  ],
  "alertas": [
    "Meta 'Viagem' sem aportes há 30 dias"
  ],
  "recomendacoes": [
    "Criar meta de reserva de emergência"
  ]
}

Melhorias em endpoints existentes:

GET /api/v1/metas
- Adicionar filtros: ?status=EM_ANDAMENTO&tipo=ECONOMIA
- Ordenação: ?sort=progresso,desc
- Projeção: ?fields=id,nome,progresso,valorAtual

GET /api/v1/metas/{id}
- Query: ?incluir=transacoes,marcos,vinculadas
```

---

### 5. **DashboardController**

#### ✅ Melhorias Sugeridas

```
Novos Endpoints:

GET /api/v1/dashboard/resumo
Response: Dados essenciais (cache 1min)
{
  "saldoAtual": 5000,
  "receitaMes": 8000,
  "despesaMes": 3000,
  "despesasPendentes": 5,
  "metasAtivas": 3,
  "alertas": 2
}

GET /api/v1/dashboard/receitas-despesas
Query: ?mes=11&ano=2024
Response: Detalhamento completo (cache 5min)

GET /api/v1/dashboard/categorias
Query: ?mes=11&ano=2024
Response: Análise por categoria (cache 15min)

GET /api/v1/dashboard/metas
Response: Status de todas as metas (cache 5min)

GET /api/v1/dashboard/insights
Query: ?mes=11&ano=2024
Response: (cache 30min)
{
  "comparativos": [
    "Você gastou 15% a mais que no mês passado",
    "Categoria Alimentação subiu R$ 200"
  ],
  "alertas": [
    "3 despesas vencidas",
    "Meta 'Viagem' atrasada"
  ],
  "conquistas": [
    "Primeiro mês com saldo positivo",
    "Meta 'Emergência' concluída"
  ],
  "sugestoes": [
    "Reduza 10% em Lazer para economizar R$ 150",
    "Considere criar meta de curto prazo"
  ]
}

GET /api/v1/dashboard/previsoes
Query: ?meses=3
Response: (cache 1h)
{
  "proximoMes": {
    "receitaPrevista": 8000,
    "despesaPrevista": 3500,
    "saldoPrevisto": 4500,
    "confianca": 85
  },
  "tendencias": [
    "Gastos crescendo 5% ao mês",
    "Categoria Saúde em alta",
    "Economia progressiva"
  ],
  "alertasPreditivos": [
    "IPVA no próximo mês: R$ 1.200",
    "Meta 'Carro' pode não ser atingida no prazo"
  ]
}

GET /api/v1/dashboard/sazonalidade
Response: (cache 1h)
{
  "janeiro": { "mediaReceita": 8000, "mediaDespesa": 3500 },
  "fevereiro": { "mediaReceita": 8000, "mediaDespesa": 3200 },
  ...
  "dezembro": { "mediaReceita": 9500, "mediaDespesa": 4500 },
  "insights": [
    "Dezembro costuma ter mais gastos (+40%)",
    "Janeiro tem despesas escolares"
  ]
}

GET /api/v1/dashboard/fluxo-caixa
Query: ?meses=6
Response: Evolução mês a mês
{
  "historico": [
    {
      "mes": "2024-06",
      "receitas": 8000,
      "despesas": 3000,
      "saldo": 5000,
      "acumulado": 25000
    },
    ...
  ],
  "tendenciaLinear": "crescente",
  "previsaoProximoMes": 5200
}

GET /api/v1/dashboard/kpis
Response: Indicadores-chave
{
  "taxaEconomia": 62.5,
  "taxaEndividamento": 37.5,
  "capacidadePagamento": 95,
  "saudeFinanceira": 85,
  "classificacao": "Boa",
  "metasNoPlano": 2,
  "metasAtrasadas": 1,
  "diasParaProximaParcela": 5,
  "valorMedioGastoDiario": 100,
  "categoriaMaisCara": "Alimentação",
  "variacaoMensal": 15.5
}

GET /api/v1/dashboard/comparar-periodos
Query: ?periodo1=2024-10&periodo2=2024-11
Response: Comparação detalhada

GET /api/v1/dashboard/relatorio-mensal
Query: ?mes=11&ano=2024
Response: Relatório completo para export

GET /api/v1/dashboard/widgets
Response: Configuração de widgets do usuário
{
  "widgets": [
    { "id": "saldo", "posicao": 1, "visivel": true },
    { "id": "metas", "posicao": 2, "visivel": true },
    { "id": "categorias", "posicao": 3, "visivel": false }
  ]
}

PUT /api/v1/dashboard/widgets
Body: Array de configurações
Response: { "message": "Widgets atualizados" }

GET /api/v1/dashboard/notificacoes
Response: Notificações pendentes
{
  "count": 5,
  "notificacoes": [
    {
      "tipo": "DESPESA_VENCIDA",
      "prioridade": "ALTA",
      "mensagem": "3 despesas vencidas",
      "data": "2024-11-13T10:00:00",
      "lida": false
    }
  ]
}

PATCH /api/v1/dashboard/notificacoes/{id}/ler
Response: 204 No Content

DELETE /api/v1/dashboard/notificacoes/{id}
Response: 204 No Content

GET /api/v1/dashboard/export
Query: ?formato=PDF|EXCEL&mes=11&ano=2024
Response: File download

Melhorias em endpoints existentes:

GET /api/v1/dashboard
- Adicionar query: ?incluir=insights,previsoes,kpis
- Modo simplificado: ?modo=simples (menos dados)
- Período customizado: ?inicio=...&fim=...
```

---

### 6. **CategoriaController**

#### ✅ Melhorias Sugeridas

```
Novos Endpoints:

POST /api/v1/categorias/importar
Content-Type: multipart/form-data
File: categorias.csv
Response: {
  "importadas": 15,
  "erros": 2,
  "detalhes": [...]
}

GET /api/v1/categorias/exportar
Query: ?formato=CSV|EXCEL|JSON
Response: File download

POST /api/v1/categorias/{id}/duplicar
Body: {
  "novoNome": "Alimentação - Delivery",
  "manterDespesas": false
}
Response: CategoriaResponseDTO

GET /api/v1/categorias/hierarquia
Response: Árvore hierárquica
{
  "categorias": [
    {
      "id": 1,
      "nome": "Alimentação",
      "subcategorias": [
        { "id": 2, "nome": "Restaurantes" },
        { "id": 3, "nome": "Supermercado" }
      ]
    }
  ]
}

POST /api/v1/categorias/{id}/subcategoria
Body: {
  "nome": "Fast Food",
  "tipo": "DESPESA"
}
Response: CategoriaResponseDTO

PUT /api/v1/categorias/{id}/mover
Body: {
  "novoIdPai": 5
}
Response: CategoriaResponseDTO

POST /api/v1/categorias/reordenar
Body: [
  { "id": 1, "ordem": 1 },
  { "id": 2, "ordem": 2 },
  { "id": 3, "ordem": 3 }
]
Response: { "message": "Ordem atualizada" }

GET /api/v1/categorias/{id}/estatisticas
Query: ?periodo=6 (meses)
Response: {
  "totalGastoHistorico": 15000,
  "mediaMensal": 2500,
  "mesMaiorGasto": { "mes": "2024-10", "valor": 3500 },
  "evolucao": [
    { "mes": "2024-06", "valor": 2000 },
    ...
  ],
  "comparacaoMesAnterior": { "variacao": -15, "valor": -300 },
  "percentualDoTotal": 35,
  "ranking": 1,
  "ultimasDespesas": [...]
}

GET /api/v1/categorias/sugeridas
Response: Sugestões IA
{
  "sugestoes": [
    {
      "categoriaOrigem": null,
      "categoriaSugerida": "Transporte",
      "despesas": [
        { "id": 123, "descricao": "Uber Centro" }
      ],
      "confianca": 95
    }
  ]
}

POST /api/v1/categorias/aplicar-sugestao
Body: {
  "despesaId": 123,
  "categoriaId": 5
}
Response: { "message": "Categoria aplicada" }

PATCH /api/v1/categorias/lote/ativar
Body: {
  "categoriaIds": [1, 2, 3]
}
Response: { "ativadas": 3 }

PATCH /api/v1/categorias/lote/desativar
Body: {
  "categoriaIds": [4, 5]
}
Response: { "desativadas": 2 }

GET /api/v1/categorias/padroes
Response: Lista de categorias padrão do sistema

POST /api/v1/categorias/criar-padroes
Response: { "criadas": 10, "message": "Categorias padrão criadas" }

GET /api/v1/categorias/{id}/uso-detalhado
Response: {
  "quantidadeDespesas": 45,
  "primeiroUso": "2024-01-15",
  "ultimoUso": "2024-11-10",
  "frequenciaMedia": "15 despesas/mês",
  "ativa": true,
  "despesasPorStatus": {
    "PAGO": 40,
    "PENDENTE": 5
  }
}
```

---

### 7. **ReceitaController & ParametroController**

#### ✅ Melhorias - ReceitaController

```
Novos Endpoints:

POST /api/v1/receitas/template
Body: {
  "nome": "Salário Padrão",
  "salario": 5000,
  "auxilios": 500,
  "servicosExtras": 0
}
Response: TemplateReceitaResponseDTO

GET /api/v1/receitas/templates
Response: Lista de templates salvos

POST /api/v1/receitas/aplicar-template/{id}
Body: {
  "periodoInicio": "2024-12-01",
  "periodoFim": "2024-12-31"
}
Response: ReceitaResponseDTO

POST /api/v1/receitas/copiar-mes-anterior
Body: {
  "mes": 12,
  "ano": 2024
}
Response: ReceitaResponseDTO

GET /api/v1/receitas/previsao/{mes}/{ano}
Response: {
  "receitaPrevista": 8000,
  "baseadoEm": "Média últimos 6 meses",
  "confianca": 85,
  "detalhamento": {
    "salario": 5000,
    "auxilios": 500,
    "servicosExtras": 2500
  }
}

GET /api/v1/receitas/comparativo
Query: ?ano1=2023&ano2=2024
Response: Comparação ano a ano

GET /api/v1/receitas/fontes
Response: Análise por fonte
{
  "salario": { "total": 60000, "percentual": 75 },
  "auxilios": { "total": 6000, "percentual": 7.5 },
  "servicosExtras": { "total": 14000, "percentual": 17.5 }
}

POST /api/v1/receitas/vincular-conta
Body: {
  "receitaId": 123,
  "contaBancariaId": 5
}
Response: { "message": "Receita vinculada à conta" }
```

#### ✅ Melhorias - ParametroController

```
Novos Endpoints:

GET /api/v1/parametros/grupos
Response: Lista agrupada
{
  "NOTIFICACOES": [
    { "chave": "email_ativo", "valor": "true" },
    { "chave": "push_ativo", "valor": "false" }
  ],
  "DASHBOARD": [...],
  "PRIVACIDADE": [...]
}

PUT /api/v1/parametros/grupos/{grupo}
Body: {
  "parametros": [
    { "chave": "email_ativo", "valor": "true" },
    { "chave": "push_ativo", "valor": "true" }
  ]
}
Response: { "atualizados": 2 }

GET /api/v1/parametros/{id}/historico
Response: Histórico de alterações
{
  "historico": [
    {
      "data": "2024-11-10T15:00:00",
      "valorAnterior": "false",
      "valorNovo": "true",
      "alteradoPor": "Usuario"
    }
  ]
}

POST /api/v1/parametros/{id}/rollback
Body: {
  "versao": 2
}
Response: ParametroResponseDTO

GET /api/v1/parametros/validacoes
Response: Schema de validação
{
  "parametros": [
    {
      "chave": "lembrete_dias_antes",
      "tipo": "NUMBER",
      "min": 1,
      "max": 30,
      "required": true
    }
  ]
}

POST /api/v1/parametros/reset-padroes
Response: { "resetados": 15, "message": "Parâmetros restaurados" }

GET /api/v1/parametros/defaults
Response: Valores padrão globais

POST /api/v1/parametros/importar-perfil
Body: {
  "perfil": "CONSERVADOR" | "MODERADO" | "AGRESSIVO"
}
Response: { "importados": 20, "message": "Perfil aplicado" }
```

---

### 8. **UsuarioController**

#### ✅ Melhorias Sugeridas

```
Novos Endpoints:

GET /api/v1/usuarios/{id}/atividades
Query: ?tipo=LOGIN|DESPESA|META&inicio=...&fim=...
Response: Timeline de atividades

GET /api/v1/usuarios/{id}/estatisticas
Response: {
  "dataCadastro": "2024-01-01",
  "diasAtivo": 315,
  "totalDespesas": 450,
  "totalReceitas": 12,
  "totalMetas": 5,
  "metasConcluidas": 2,
  "categoriasCriadas": 15,
  "ultimoAcesso": "2024-11-13T09:00:00"
}

POST /api/v1/usuarios/{id}/avatar
Content-Type: multipart/form-data
File: avatar.jpg
Response: { "fotoUrl": "https://..." }

DELETE /api/v1/usuarios/{id}/avatar
Response: 204 No Content

POST /api/v1/usuarios/{id}/export-dados
Response: {
  "downloadUrl": "https://...",
  "expiresIn": "24h",
  "formato": "JSON"
}

POST /api/v1/usuarios/{id}/solicitar-exclusao
Response: {
  "message": "Solicitação registrada",
  "prazo": "30 dias",
  "cancelavel": true
}

DELETE /api/v1/usuarios/{id}/cancelar-exclusao
Response: { "message": "Exclusão cancelada" }

GET /api/v1/usuarios/{id}/preferencias
Response: Todas preferências do usuário

PUT /api/v1/usuarios/{id}/preferencias
Body: {
  "tema": "DARK",
  "idioma": "pt-BR",
  "moeda": "BRL",
  "notificacoesEmail": true,
  "notificacoesPush": false
}
Response: PreferenciasResponseDTO

PATCH /api/v1/usuarios/{id}/privacidade
Body: {
  "perfilPublico": false,
  "compartilharDados": false
}
Response: { "message": "Privacidade atualizada" }

GET /api/v1/usuarios/pesquisar
Query: ?nome=...&email=...&tipo=USER|ADMIN&ativo=true
Response: Lista filtrada (apenas admin)

POST /api/v1/usuarios/{id}/conceder-admin
Response: { "message": "Privilégios admin concedidos" }

POST /api/v1/usuarios/{id}/revogar-admin
Response: { "message": "Privilégios admin revogados" }

GET /api/v1/usuarios/dashboard-admin
Response: (apenas admin)
{
  "totalUsuarios": 1500,
  "usuariosAtivos": 1450,
  "novosMes": 50,
  "taxaCrescimento": 3.4,
  "usuariosPremium": 300
}
```

---

## 🔐 MELHORIAS TRANSVERSAIS (Todos Controllers)

### 1. **Segurança**

```
Implementar em todos:

1. Input Sanitization
   - Validar/limpar todos inputs
   - Prevenir XSS, SQL Injection
   - Escapar caracteres especiais

2. Output Encoding
   - Encode dados antes de retornar
   - Prevenir XSS no frontend

3. CORS Configurável
   - Whitelist de origens
   - Métodos permitidos
   - Headers permitidos

4. CSRF Protection
   - Token CSRF para operações sensíveis
   - SameSite cookies

5. Audit Logging
   - Log todas operações críticas
   - IP, User-Agent, Data/Hora
   - Retenção configurável

6. Data Masking
   - Ocultar dados sensíveis nos logs
   - Email: u***@example.com
   - CPF: ***.***.123-45
```

---

### 2. **Performance**

```
Implementar em todos:

1. Compressão Gzip/Brotli
   - Respostas comprimidas
   - Reduz bandwidth 60-80%

2. ETags
   - Cache baseado em hash
   - Evita transferência se não mudou

3. Async/CompletableFuture
   - Operações longas assíncronas
   - Não bloqueia thread

4. Query Optimization
   - N+1 queries → JOIN FETCH
   - Projeções ao invés de entidades completas
   - Índices adequados

5. Connection Pooling
   - HikariCP otimizado
   - Tamanho pool adequado

6. Lazy Loading Inteligente
   - Carrega relacionamentos só quando necessário
   - @EntityGraph para controlar o fetch

7. Batch Operations
   - Salvar/Atualizar em lote
   - Reduz round-trips ao banco
   - saveAll() ao invés de múltiplos save()

8. Database Pagination
   - NUNCA carregar tudo em memória
   - Usar Pageable nativo
   - LIMIT/OFFSET no SQL

9. Response Streaming
   - Para grandes volumes
   - Stream de dados progressivo
   - Não aguardar processamento completo

10. Circuit Breaker
    - Proteger serviços externos
    - Fallback quando falhar
    - Resilience4j
```

---

### 3. **Observabilidade**

```
Implementar em todos:

1. Structured Logging
   - JSON format
   - Contexto completo
   - TraceId/SpanId

Exemplo:
{
  "timestamp": "2024-11-13T10:30:00",
  "level": "INFO",
  "service": "financeiro-api",
  "traceId": "abc123",
  "userId": 456,
  "endpoint": "POST /api/v1/despesas",
  "duration": 150,
  "status": 201,
  "message": "Despesa criada com sucesso"
}

2. Distributed Tracing
   - Sleuth + Zipkin/Jaeger
   - Rastreio end-to-end
   - Identificar gargalos

3. Métricas Customizadas
   - Micrometer
   - Tempo de resposta por endpoint
   - Taxa de erros
   - Throughput
   - Business metrics (despesas criadas/min)

4. Health Checks Detalhados
   /actuator/health:
   {
     "status": "UP",
     "components": {
       "db": "UP",
       "redis": "UP",
       "diskSpace": "UP",
       "custom": {
         "despesasService": "UP",
         "emailService": "DEGRADED"
       }
     }
   }

5. Alerting
   - Prometheus + Grafana
   - Alertas automáticos:
     * Taxa erro > 1%
     * Latência > 1s
     * CPU > 80%
     * Memória > 90%
```

---

### 4. **Validação Avançada**

```
Implementar validações além do Bean Validation:

1. Validação de Negócio em Service
   - Regras complexas
   - Validações com queries
   - Consistência de dados

2. Validação Condicional
   @ConditionalValidation
   - Validar campo A se campo B presente
   - Diferentes regras por contexto

3. Validação Cross-Field
   - Validar relacionamento entre campos
   - Data fim > Data início
   - Valor parcela <= Valor total

4. Validação Assíncrona
   - Verificar duplicidade
   - Validar com APIs externas
   - Não bloquear request

5. Mensagens de Erro Melhoradas
   Ao invés de:
   "Valor inválido"
   
   Usar:
   "O valor deve ser maior que zero e menor que R$ 100.000,00"

6. Validação por Perfil
   - Regras diferentes USER vs ADMIN
   - Limites por plano (Free/Premium)

Exemplo:
@ValidDespesa(groups = {Create.class, Update.class})
public class DespesaRequestDTO {
    
    @NotNull(groups = Create.class)
    @Positive
    @Max(value = 100000, message = "Valor máximo: R$ 100.000,00")
    private BigDecimal valor;
    
    @NotNull
    @FutureOrPresent(message = "Data não pode ser no passado")
    private LocalDate data;
    
    @CrossFieldValidation(
        field1 = "parcelaAtual",
        field2 = "parcelaTotal",
        message = "Parcela atual não pode exceder total"
    )
    private void validateParcelas() { }
}
```

---

### 5. **Internacionalização (i18n)**

```
Preparar para múltiplos idiomas:

1. Messages.properties
   messages_pt_BR.properties:
   despesa.criada=Despesa criada com sucesso
   despesa.erro.valor=Valor deve ser positivo
   
   messages_en_US.properties:
   despesa.criada=Expense created successfully
   despesa.erro.valor=Value must be positive

2. Locale Resolver
   - Detectar idioma do header Accept-Language
   - Fallback para pt-BR
   - Sobrescrever com query param: ?lang=en

3. DTOs Traduzidos
   {
     "message": "Despesa criada com sucesso",
     "message_key": "despesa.criada"
   }

4. Validação Localizada
   @NotNull(message = "{validation.notnull}")
   @Positive(message = "{validation.positive}")

5. Datas/Números Formatados
   - Usar locale para formato
   - pt-BR: 1.500,50
   - en-US: 1,500.50
```

---

### 6. **Testes Automatizados**

```
Cobertura necessária para cada controller:

1. Testes Unitários (Service)
   - Mocks de dependencies
   - Cobrir todos cenários de negócio
   - Happy path + Edge cases

@Test
void deveCriarDespesaComSucesso() {
    // Arrange
    when(usuarioRepository.findById(1L))
        .thenReturn(Optional.of(usuario));
    
    // Act
    DespesaResponseDTO result = service.create(request);
    
    // Assert
    assertNotNull(result);
    assertEquals(100.0, result.getValor());
    verify(repository, times(1)).save(any());
}

2. Testes de Integração (Controller)
   - @WebMvcTest
   - MockMvc
   - Validar requests/responses

@Test
void deveRetornar201AoCriarDespesa() throws Exception {
    mockMvc.perform(post("/api/v1/despesas")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request))
        .header("Authorization", "Bearer " + token))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").exists())
        .andExpect(jsonPath("$.valor").value(100.0));
}

3. Testes E2E (Completo)
   - @SpringBootTest
   - TestRestTemplate
   - Banco H2 em memória

@Test
void fluxoCompletoCriacaoDespesa() {
    // 1. Login
    AuthResponseDTO auth = login();
    
    // 2. Criar categoria
    CategoriaResponseDTO cat = criarCategoria(auth.getToken());
    
    // 3. Criar despesa
    DespesaResponseDTO desp = criarDespesa(cat.getId(), auth.getToken());
    
    // 4. Verificar criação
    assertNotNull(desp.getId());
}

4. Testes de Performance
   - JMeter
   - Gatling
   - k6

Cenários:
- 100 usuários simultâneos
- 1000 req/segundo
- Tempo resposta < 200ms (p95)

5. Testes de Segurança
   - OWASP ZAP
   - SonarQube
   - Dependency Check

Validar:
- SQL Injection
- XSS
- CSRF
- Autenticação/Autorização
- Vulnerabilidades conhecidas
```

---

### 7. **Documentação Interativa**

```
Melhorias no Swagger/OpenAPI:

1. Descrições Detalhadas
@Operation(
    summary = "Criar nova despesa",
    description = """
        Cria uma nova despesa para o usuário autenticado.
        
        **Regras de negócio:**
        - Valor deve ser positivo
        - Categoria deve estar ativa
        - Data não pode ser muito no passado (>1 ano)
        - Parcelas: atual <= total
        
        **Permissões:**
        - Requer autenticação (Bearer token)
        - Usuário pode criar apenas suas próprias despesas
        
        **Rate limit:**
        - 100 requisições por minuto
        """,
    tags = {"Despesas"}
)

2. Exemplos Realistas
@Schema(example = """
    {
      "descricao": "Supermercado Extra",
      "valor": 235.50,
      "data": "2024-11-13",
      "categoriaId": 1,
      "status": "PENDENTE",
      "observacoes": "Compras do mês"
    }
    """)

3. Códigos de Erro Documentados
@ApiResponse(
    responseCode = "400",
    description = "Dados inválidos",
    content = @Content(
        examples = @ExampleObject(value = """
            {
              "success": false,
              "message": "Erro de validação",
              "errors": [
                {
                  "field": "valor",
                  "message": "Valor deve ser positivo"
                }
              ]
            }
            """)
    )
)

4. Agrupamento Lógico
@Tag(name = "Despesas", description = "Gerenciamento de despesas do usuário")
@Tag(name = "Despesas - Admin", description = "Operações administrativas")

5. Versionamento Visível
@Info(
    title = "Financeiro Pessoal API",
    version = "v1.0.0",
    description = "API REST para gestão financeira pessoal"
)

6. Autenticação Documentada
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "Autenticação JWT. Obtenha o token em /auth/login"
)

7. Try it Out Funcional
- Ambiente de testes integrado
- Token pré-configurado
- Dados de exemplo
```

---

### 8. **Versionamento e Deprecação**

```
Estratégia de versionamento:

1. Estrutura de URLs
   /api/v1/despesas (versão atual)
   /api/v2/despesas (próxima versão)

2. Deprecação Gradual
@Deprecated(since = "1.5", forRemoval = true)
@ApiOperation(
    value = "Buscar despesas (DEPRECATED)",
    notes = "Use /api/v2/despesas. Será removido em 01/2025"
)
public ResponseEntity<?> findAllV1() { }

3. Headers de Versão
Response Headers:
X-API-Version: 1.0
X-API-Deprecated: false
X-API-Sunset: 2025-01-01 (quando será removido)

4. Changelog Público
/api/changelog
{
  "versions": [
    {
      "version": "1.5.0",
      "date": "2024-11-01",
      "changes": [
        {
          "type": "FEATURE",
          "description": "Adicionado filtro avançado de despesas"
        },
        {
          "type": "DEPRECATED",
          "endpoint": "GET /despesas/old",
          "replacement": "GET /api/v2/despesas",
          "removalDate": "2025-01-01"
        }
      ]
    }
  ]
}

5. Compatibilidade Retroativa
- Manter v1 funcionando por 6 meses
- Adicionar novos campos como opcionais
- Não remover campos existentes
- Avisar com antecedência
```

---

### 9. **Filtros e Paginação Padronizados**

```
Padronizar em todos endpoints de listagem:

1. Paginação Consistente
GET /api/v1/despesas?page=0&size=20&sort=data,desc

Response:
{
  "content": [...],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  },
  "links": {
    "first": "/api/v1/despesas?page=0&size=20",
    "prev": null,
    "self": "/api/v1/despesas?page=0&size=20",
    "next": "/api/v1/despesas?page=1&size=20",
    "last": "/api/v1/despesas?page=7&size=20"
  }
}

2. Filtros Query Params
GET /api/v1/despesas?categoria=1,2,3&status=PENDENTE,VENCIDO&valorMin=100&valorMax=1000

3. Busca Global
GET /api/v1/despesas?q=supermercado
- Busca em descrição, observações, categoria

4. Ordenação Múltipla
GET /api/v1/despesas?sort=data,desc&sort=valor,asc

5. Campos Específicos (Projeção)
GET /api/v1/despesas?fields=id,descricao,valor,data
- Retorna apenas campos solicitados
- Reduz payload

6. Incluir Relacionamentos
GET /api/v1/despesas?include=categoria,receita
- Controla eager/lazy loading

7. Filtros Avançados (POST)
POST /api/v1/despesas/search
{
  "filters": {
    "categorias": [1, 2],
    "dataInicio": "2024-01-01",
    "dataFim": "2024-12-31",
    "valorMin": 100,
    "valorMax": 1000,
    "descricaoContains": "mercado",
    "status": ["PENDENTE"]
  },
  "sort": [
    { "field": "data", "direction": "DESC" }
  ],
  "page": 0,
  "size": 20
}

8. Exportação com Filtros
GET /api/v1/despesas/export?formato=CSV&categoria=1&inicio=2024-01-01&fim=2024-12-31
```

---

### 10. **Tratamento de Erros Unificado**

```
@ControllerAdvice para tratamento global:

1. Estrutura Padronizada
{
  "success": false,
  "timestamp": "2024-11-13T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Erro de validação",
  "path": "/api/v1/despesas",
  "traceId": "abc123",
  "errors": [
    {
      "field": "valor",
      "rejectedValue": -100,
      "message": "Valor deve ser positivo",
      "code": "POSITIVE_VALUE_REQUIRED"
    }
  ]
}

2. Códigos de Erro Consistentes
VALIDATION_ERROR
RESOURCE_NOT_FOUND
UNAUTHORIZED
FORBIDDEN
DUPLICATE_RESOURCE
BUSINESS_RULE_VIOLATION
EXTERNAL_SERVICE_ERROR
DATABASE_ERROR

3. Mensagens Localizadas
- Baseado no Accept-Language
- Fallback para português
- Código de erro sempre em inglês (para logs)

4. Stack Trace Apenas em Dev
- Produção: Ocultar detalhes técnicos
- Dev: Stack completo
- Logs: Tudo registrado

5. Retry Information
{
  "error": "EXTERNAL_SERVICE_ERROR",
  "message": "Serviço temporariamente indisponível",
  "retryable": true,
  "retryAfter": 30,
  "retryUrl": "/api/v1/despesas"
}

6. Erros Específicos por Contexto
ValidationException → 400
ResourceNotFoundException → 404
UnauthorizedException → 401
ForbiddenException → 403
DuplicateResourceException → 409
BusinessRuleException → 422
ExternalServiceException → 502
DatabaseException → 500

Implementação:

@ExceptionHandler(ValidationException.class)
public ResponseEntity<ErrorResponse> handleValidation(
    ValidationException ex,
    WebRequest request
) {
    ErrorResponse error = ErrorResponse.builder()
        .success(false)
        .timestamp(LocalDateTime.now())
        .status(HttpStatus.BAD_REQUEST.value())
        .error("Validation Error")
        .message(ex.getMessage())
        .path(request.getDescription(false))
        .traceId(MDC.get("traceId"))
        .errors(ex.getFieldErrors())
        .build();
    
    log.error("Validation error: {}", ex.getMessage(), ex);
    
    return ResponseEntity
        .status(HttpStatus.BAD_REQUEST)
        .body(error);
}
```

---

## 📊 MELHORIAS DE ARQUITETURA

### 1. **Event-Driven Architecture**

```
Implementar eventos assíncronos:

1. Eventos de Domínio
@DomainEvent
public class DespesaCriadaEvent {
    private Long despesaId;
    private Long usuarioId;
    private BigDecimal valor;
    private LocalDateTime timestamp;
}

2. Event Publisher
@Service
public class DespesaService {
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public DespesaResponseDTO create(DespesaRequestDTO dto) {
        Despesa despesa = // ... criar despesa
        
        // Publica evento
        eventPublisher.publishEvent(
            new DespesaCriadaEvent(despesa)
        );
        
        return mapper.toDto(despesa);
    }
}

3. Event Listeners
@Component
public class DespesaEventListener {
    
    @EventListener
    @Async
    public void handleDespesaCriada(DespesaCriadaEvent event) {
        // Atualizar cache dashboard
        cacheService.invalidateDashboard(event.getUsuarioId());
        
        // Verificar orçamento
        orcamentoService.verificarLimite(event);
        
        // Enviar notificação se próximo do limite
        if (limiteProximo) {
            notificationService.alertar(event.getUsuarioId());
        }
    }
    
    @EventListener
    @Async
    public void atualizarEstatisticas(DespesaCriadaEvent event) {
        estatisticasService.recalcular(event.getUsuarioId());
    }
}

4. Eventos Principais
- DespesaCriadaEvent
- DespesaAtualizadaEvent
- DespesaDeletadaEvent
- DespesaPagaEvent
- MetaConcluidaEvent
- MetaAtrasadaEvent
- OrcamentoUltrapassadoEvent
- ReceitaRecebidaEvent

Benefícios:
- Desacoplamento
- Processamento assíncrono
- Fácil adicionar novos listeners
- Melhor testabilidade
```

---

### 2. **CQRS (Command Query Responsibility Segregation)**

```
Separar leitura e escrita:

1. Commands (Escrita)
@Command
public class CriarDespesaCommand {
    private DespesaRequestDTO dados;
    private Long usuarioId;
}

@CommandHandler
public class CriarDespesaHandler {
    
    @Transactional
    public DespesaResponseDTO handle(CriarDespesaCommand cmd) {
        // Validações
        // Criar despesa
        // Publicar evento
        // Retornar DTO
    }
}

2. Queries (Leitura)
@Query
public class BuscarDespesasQuery {
    private Long usuarioId;
    private FiltrosDespesa filtros;
    private Pageable pageable;
}

@QueryHandler
public class BuscarDespesasHandler {
    
    @Transactional(readOnly = true)
    public Page<DespesaResponseDTO> handle(BuscarDespesasQuery query) {
        // Buscar com filtros
        // Usar projeções
        // Retornar DTOs
    }
}

3. Controller Simplificado
@RestController
public class DespesaController {
    
    @Autowired
    private CommandBus commandBus;
    
    @Autowired
    private QueryBus queryBus;
    
    @PostMapping
    public ResponseEntity<?> create(@RequestBody DespesaRequestDTO dto) {
        CriarDespesaCommand cmd = new CriarDespesaCommand(dto);
        DespesaResponseDTO result = commandBus.execute(cmd);
        return ResponseEntity.status(201).body(result);
    }
    
    @GetMapping
    public ResponseEntity<?> findAll(FiltrosDespesa filtros, Pageable pageable) {
        BuscarDespesasQuery query = new BuscarDespesasQuery(filtros, pageable);
        Page<DespesaResponseDTO> result = queryBus.execute(query);
        return ResponseEntity.ok(result);
    }
}

Benefícios:
- Controllers mais limpos
- Handlers reutilizáveis
- Testabilidade
- Separação clara de responsabilidades
```

---

### 3. **API Gateway Pattern**

```
Para futuro com microserviços:

1. Estrutura
[Frontend]
    ↓
[API Gateway] (Spring Cloud Gateway)
    ↓
├─→ [Auth Service]
├─→ [Despesas Service]
├─→ [Metas Service]
├─→ [Dashboard Service]
└─→ [Notificações Service]

2. Gateway Features
- Roteamento
- Rate limiting
- Autenticação centralizada
- Load balancing
- Circuit breaker
- Request/Response transformation
- Logging centralizado

3. Configuração
spring:
  cloud:
    gateway:
      routes:
        - id: despesas
          uri: lb://despesas-service
          predicates:
            - Path=/api/v1/despesas/**
          filters:
            - AuthFilter
            - RateLimitFilter
```

---

## 🎯 PRIORIZAÇÃO DAS MELHORIAS

### 🔴 **CRÍTICO - Implementar IMEDIATAMENTE**

1. ✅ **Paginação nativa do banco** (Performance)
2. ✅ **Tratamento de erros unificado** (UX)
3. ✅ **Recuperação de senha** (Essencial)
4. ✅ **Rate limiting básico** (Segurança)
5. ✅ **Logging estruturado** (Observabilidade)

### 🟡 **IMPORTANTE - Próximos 30 dias**

6. ✅ **Busca avançada com filtros** (UX)
7. ✅ **Despesas recorrentes** (Funcionalidade chave)
8. ✅ **Aportes recorrentes em metas** (Conveniência)
9. ✅ **Insights automáticos no dashboard** (Valor agregado)
10. ✅ **Verificação de email** (Segurança)

### 🟢 **DESEJÁVEL - Próximos 60 dias**

11. ✅ **Categorias hierárquicas** (Organização)
12. ✅ **Simulador de metas** (Planejamento)
13. ✅ **Sistema de lembretes** (Conveniência)
14. ✅ **Importação/Exportação** (Portabilidade)
15. ✅ **Previsões e tendências** (IA simples)

### 🔵 **FUTURO - Próximos 90+ dias**

16. ✅ **CQRS Pattern** (Arquitetura)
17. ✅ **Event-Driven** (Escalabilidade)
18. ✅ **Categorização IA** (Machine Learning)
19. ✅ **Integração bancária** (Open Banking)
20. ✅ **API Gateway** (Microserviços)

---

## 📝 RESUMO EXECUTIVO

### Principais Problemas Atuais:
1. ❌ Paginação ineficiente (carrega tudo em memória)
2. ❌ Falta de filtros avançados
3. ❌ Cache muito abrangente (invalidação desnecessária)
4. ❌ Falta de funcionalidades essenciais (recuperação senha, despesas recorrentes)
5. ❌ Observabilidade limitada

### Ganhos Esperados com Melhorias:
- 📈 **Performance:** 70% mais rápido com paginação nativa
- 🚀 **Escalabilidade:** Suporta 10x mais usuários
- 🛡️ **Segurança:** Proteção contra ataques comuns
- 💡 **UX:** Insights automáticos, sugestões inteligentes
- 🔧 **Manutenibilidade:** Código mais limpo, testável

### ROI Estimado:
- ⏱️ **Tempo de desenvolvimento:** +30% inicial
- 💰 **Redução de custos:** -40% infraestrutura (cache, queries otimizadas)
- 📊 **Retenção de usuários:** +25% (funcionalidades úteis)
- 🐛 **Bugs em produção:** -60% (testes, validações)

---

Quer que eu detalhe a implementação de alguma dessas melhorias específicas? Posso criar a documentação técnica completa com diagramas de sequência, estrutura de classes e exemplos de código! 🚀

GET /api/v1/auth/validar-token?token=...
Response: { "valid": true, "
