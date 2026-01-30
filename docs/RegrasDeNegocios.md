# 📋 Regras de Negócio

## Visão Geral

Este documento define todas as regras de negócio, validações, cálculos e comportamentos esperados do Sistema de Gestão Financeira Pessoal. Estas regras garantem a consistência e integridade dos dados e processos.

## Índice

1. [Autenticação e Autorização](#autenticação-e-autorização)
2. [Gestão de Usuários](#gestão-de-usuários)
3. [Receitas](#receitas)
4. [Despesas](#despesas)
5. [Categorias](#categorias)
6. [Metas Financeiras](#metas-financeiras)
7. [Dashboard e Relatórios](#dashboard-e-relatórios)
8. [Notificações](#notificações)
9. [Inteligência Artificial](#inteligência-artificial)
10. [Limites e Quotas](#limites-e-quotas)

---

## Autenticação e Autorização

### RN-AUTH-001: Registro de Novo Usuário

**Regra:**
- Email deve ser único no sistema (case-insensitive)
- Senha deve ter mínimo de 8 caracteres
- Senha deve conter: 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial
- Nome completo é obrigatório
- Ao criar conta, tipo_usuario padrão é 'FREE'

**Validações:**
```
- Email válido (regex RFC 5322)
- Email não existe (LOWER(email))
- Senha complexidade: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$
- Nome mínimo 3 caracteres
```

**Ações Automáticas:**
1. Criar categorias padrão para o usuário
2. Enviar email de verificação
3. Criar parâmetros iniciais personalizados
4. Gerar evento `UsuarioCriadoEvent`

### RN-AUTH-002: Login

**Regra:**
- Máximo 5 tentativas falhas em 15 minutos
- Após 5 tentativas, bloquear conta por 30 minutos
- Resetar contador após login bem-sucedido
- JWT expira em 24 horas
- Refresh token expira em 7 dias

**Validações:**
```
- Email existe e está ativo
- Conta não está bloqueada (bloqueado_ate < NOW())
- Senha corresponde ao hash armazenado (Argon2)
- Email verificado (email_verificado = TRUE)
```

**Ações Automáticas:**
1. Atualizar ultimo_acesso
2. Resetar tentativas_login para 0
3. Gerar JWT com claims: userId, email, tipo_usuario
4. Registrar login em auditoria

### RN-AUTH-003: Bloqueio de Conta

**Regra:**
- Após 5 tentativas falhas consecutivas
- Bloquear por 30 minutos na primeira vez
- Bloquear por 2 horas na segunda vez (mesmo dia)
- Bloquear por 24 horas na terceira vez
- Admin pode desbloquear manualmente

**Notificação:**
- Enviar email alertando sobre tentativas suspeitas
- Incluir IP e localização aproximada

### RN-AUTH-004: Alteração de Senha

**Regra:**
- Senha antiga deve ser validada
- Nova senha não pode ser igual às últimas 3 senhas
- Forçar logout em todos dispositivos após mudança
- Invalidar todos tokens JWT existentes

**Histórico:**
- Manter hash das últimas 3 senhas em `senha_historico` (JSONB)
- Armazenar data de cada mudança

---

## Gestão de Usuários

### RN-USR-001: Soft Delete

**Regra:**
- Deleção é sempre lógica (soft delete)
- deleted_at marca timestamp da "exclusão"
- Dados permanecem por 90 dias para recovery
- Após 90 dias, job automatizado faz hard delete
- Email fica reservado por 180 dias

**Processo:**
1. Marcar deleted_at = CURRENT_TIMESTAMP
2. Anonimizar dados sensíveis imediatamente:
   - email → `deleted_user_{id}@anonimizado.com`
   - nome → `Usuário Removido`
   - foto_url → NULL
3. Manter dados financeiros para compliance

### RN-USR-002: Verificação de Email

**Regra:**
- Token de verificação expira em 24 horas
- Máximo 3 reenvios por dia
- Após verificação, liberar recursos premium trial (7 dias)
- Usuários não verificados têm funcionalidades limitadas

**Limitações sem Verificação:**
- Máximo 10 despesas/mês
- Máximo 2 metas
- Sem acesso a IA
- Sem exportação de dados

### RN-USR-003: Tipos de Usuário

| Tipo | Limite Despesas/Mês | Limite Metas | IA | Export | Suporte |
|------|---------------------|--------------|----|---------|----- ---|
| FREE | 100 | 5 | ❌ | CSV | Email |
| PREMIUM | Ilimitado | 20 | ✅ | CSV, PDF, Excel | Email + Chat |
| ENTERPRISE | Ilimitado | Ilimitado | ✅ Premium | Todos + API | Dedicado |

**Regra de Upgrade:**
- Upgrade imediato após pagamento confirmado
- Downgrade apenas no final do ciclo de cobrança
- Dados acima do limite ficam read-only no downgrade

### RN-USR-004: Preferências do Usuário

**Estrutura preferencias_json:**
```json
{
  "tema": "dark|light|auto",
  "idioma": "pt-BR|en-US|es-ES",
  "moeda": "BRL|USD|EUR",
  "formato_data": "DD/MM/YYYY|MM/DD/YYYY",
  "notificacoes": {
    "email": true,
    "push": true,
    "despesa_criada": true,
    "meta_proxima": true,
    "alerta_gasto": true,
    "insights_ia": true
  },
  "dashboard": {
    "widgets_visiveis": ["resumo", "gastos_categoria", "metas"],
    "periodo_padrao": "mes_atual"
  },
  "privacidade": {
    "analytics": false,
    "compartilhar_dados_ia": true
  }
}
```

---

## Receitas

### RN-REC-001: Criação de Receita

**Regra:**
- periodo_inicio deve ser <= periodo_fim
- Máximo de 31 dias por período
- Não pode sobrepor períodos existentes do mesmo usuário
- Valores não podem ser negativos
- Pelo menos uma fonte de renda deve ser > 0

**Validações:**
```
- periodo_fim - periodo_inicio <= 31 dias
- NOT EXISTS (SELECT 1 FROM receitas WHERE 
    usuario_id = ? AND 
    (periodo_inicio BETWEEN ? AND ? OR periodo_fim BETWEEN ? AND ?))
- (salario + auxilios + servicos_extras) > 0
```

**Cálculos Automáticos:**
1. **dias_uteis**: Contar dias excluindo sábados e domingos
   ```sql
   COUNT(*) FROM generate_series(periodo_inicio, periodo_fim, '1 day')
   WHERE EXTRACT(DOW FROM dia) NOT IN (0, 6)
   ```

2. **total_receita**: Soma de todas as fontes
   ```
   total = salario + auxilios + servicos_extras
   ```

### RN-REC-002: Edição de Receita

**Regra:**
- Não permitir alterar período se houver despesas vinculadas
- Se reduzir total e despesas > novo total, emitir alerta
- Recalcular automaticamente resumos e dashboards
- Invalidar cache relacionado

**Validações:**
```
- Se EXISTS (despesas com receita_id):
  - Não alterar periodo_inicio nem periodo_fim
  - Permitir apenas ajustes de valores
- Se SUM(despesas.valor) > novo_total:
  - Emitir WARNING (não bloquear)
  - Sugerir redistribuição ou aumento
```

### RN-REC-003: Exclusão de Receita

**Regra:**
- Não permitir excluir se houver despesas vinculadas
- Alternativa: desvincula despesas (receita_id = NULL)
- Pedir confirmação explícita do usuário
- Soft delete sempre

**Validações:**
```
- Se COUNT(despesas WHERE receita_id = ?) > 0:
  - Opção 1: Não permitir (RESTRICT)
  - Opção 2: Desvincular despesas (SET NULL)
  - Usuário escolhe
```

---

## Despesas

### RN-DSP-001: Criação de Despesa

**Regra:**
- data não pode ser futura (> CURRENT_DATE + 7 dias)
- valor deve ser > 0
- categoria_id é obrigatória
- descricao mínimo 3 caracteres
- Se parcelada, parcela_atual e parcela_total obrigatórios

**Validações:**
```
- data <= CURRENT_DATE + 7 dias
- valor > 0
- categoria EXISTS e ativa = TRUE
- descricao.length >= 3
- Se parcela_atual IS NOT NULL:
  - parcela_total IS NOT NULL
  - 1 <= parcela_atual <= parcela_total
  - fim_pagamento calculado automaticamente
```

**Cálculos Automáticos:**
1. **fim_pagamento** (se parcelado):
   ```
   fim_pagamento = data + (parcela_total - parcela_atual) MONTHS
   ```

2. **valor_parcela**:
   ```
   valor_parcela = valor / parcela_total
   ```

**Ações Automáticas:**
1. Vincular à receita do período (se existir)
2. Criar notificação se valor > média usuário * 2
3. Trigger IA para detecção de anomalias
4. Atualizar cache de dashboard
5. Verificar se excedeu meta de gastos categoria

### RN-DSP-002: Despesa Parcelada

**Regra:**
- Criar uma despesa "master" + N-1 despesas futuras
- Cada parcela é uma despesa independente
- Todas compartilham mesmo `grupo_parcelamento` UUID
- parcela_atual incrementa em cada registro

**Processo:**
```
1. Criar despesa principal (parcela 1/N)
2. Para i = 2 até N:
   - Criar despesa futura
   - data = data_original + (i-1) MONTHS
   - descricao = "desc original (parcela i/N)"
   - parcela_atual = i
   - grupo_parcelamento = UUID_master
```

**Regras de Edição:**
- Editar uma parcela: apenas ela muda
- Editar grupo: propagar para parcelas futuras não pagas
- Deletar: opção de deletar só uma ou todo grupo

### RN-DSP-003: Despesa Recorrente

**Regra:**
- recorrente = TRUE
- tipo_recorrencia IN ('DIARIA', 'SEMANAL', 'QUINZENAL', 'MENSAL', 'ANUAL')
- Job noturno cria próxima ocorrência automaticamente
- Limite: até data de término (se definida) ou indefinidamente

**Criação Automática:**
```
Job diário (02:00):
1. Buscar despesas recorrentes ativas
2. Para cada uma:
   - Calcular próxima_data baseado em tipo
   - Se próxima_data = CURRENT_DATE:
     - Criar nova despesa
     - Copiar todos campos exceto id, created_at
     - Manter mesmo grupo_recorrencia UUID
```

**Tipos:**
- DIARIA: próxima_data = última_data + 1 dia
- SEMANAL: próxima_data = última_data + 7 dias
- QUINZENAL: próxima_data = última_data + 15 dias
- MENSAL: próxima_data = último_dia + 1 mês (mesmo dia)
- ANUAL: próxima_data = último_dia + 1 ano

### RN-DSP-004: Status de Pagamento

**Estados Possíveis:**
- PENDENTE: Ainda não pago
- PAGO: Confirmado
- ATRASADO: PENDENTE + data < CURRENT_DATE
- CANCELADO: Cancelado pelo usuário

**Transições:**
```
PENDENTE → PAGO (manual)
PENDENTE → ATRASADO (automático se data < hoje)
PENDENTE → CANCELADO (manual)
PAGO → PENDENTE (estorno)
ATRASADO → PAGO (manual)
```

**Regra de Atualização Automática:**
- Job diário (01:00):
  ```sql
  UPDATE despesas 
  SET status = 'ATRASADO'
  WHERE status = 'PENDENTE' 
    AND data < CURRENT_DATE
    AND deleted_at IS NULL;
  ```

### RN-DSP-005: Validação de Valor

**Regra:**
- Alertar se despesa > 50% da receita mensal
- Bloquear se despesa > 200% da receita mensal (suspeita)
- Permitir override com confirmação

**Validações:**
```
receita_mes = SUM(receitas WHERE periodo overlap mês_despesa)
despesa_valor = valor_informado

Se despesa_valor > receita_mes * 0.5:
  - Mostrar WARNING
  - Pedir confirmação
  
Se despesa_valor > receita_mes * 2:
  - Mostrar ERROR
  - Pedir confirmação DUPLA + senha
  - Registrar em auditoria
```

### RN-DSP-006: Anexos

**Regra:**
- Formatos permitidos: PDF, JPG, PNG, JPEG
- Tamanho máximo: 5MB por arquivo
- Máximo 3 anexos por despesa
- Storage: AWS S3 ou similar
- Nomear: `despesa_{id}_{timestamp}_{original_name}`

**Processo:**
1. Validar tipo MIME real (não apenas extensão)
2. Escanear vírus (ClamAV)
3. Upload para storage
4. Salvar URL em despesa.anexo_url (JSONB array)
5. Gerar thumbnail para imagens

---

## Categorias

### RN-CAT-001: Criação de Categoria

**Regra:**
- Nome único por usuário e tipo (DESPESA/RECEITA)
- Nome mínimo 2, máximo 100 caracteres
- Cor em formato hexadecimal (#RRGGBB)
- Ícone de lista pré-definida (Lucide Icons)

**Validações:**
```
- UNIQUE (usuario_id, LOWER(TRIM(nome)), tipo)
- LENGTH(nome) BETWEEN 2 AND 100
- cor REGEX: ^#[0-9A-F]{6}$
- icone IN (lista_icones_permitidos)
```

**Categorias Padrão (criadas no registro):**

Despesas:
- Alimentação (#EF4444, utensils)
- Transporte (#F59E0B, car)
- Moradia (#8B5CF6, home)
- Saúde (#10B981, heart-pulse)
- Educação (#3B82F6, graduation-cap)
- Lazer (#EC4899, smile)
- Vestuário (#06B6D4, shirt)
- Outros (#6B7280, more-horizontal)

Receitas:
- Salário (#059669, wallet)
- Freelance (#06B6D4, briefcase)
- Investimentos (#10B981, trending-up)
- Outros (#6B7280, more-horizontal)

### RN-CAT-002: Desativação de Categoria

**Regra:**
- Não deletar, apenas marcar ativa = FALSE
- Despesas antigas mantêm vínculo
- Novas despesas não podem usar categoria inativa
- Reativação permitida a qualquer momento

**Validações:**
```
- Se COUNT(despesas WHERE categoria_id = ? AND status != 'PAGO') > 0:
  - Avisar que existem despesas pendentes
  - Opção: transferir para outra categoria
```

### RN-CAT-003: Hierarquia (Futuro)

**Regra:**
- Máximo 2 níveis (Categoria → Subcategoria)
- Subcategoria herda tipo da categoria pai
- Relatórios agregam subcategorias na categoria pai

**Estrutura:**
```
Alimentação (parent_id: NULL)
  ├── Restaurantes (parent_id: 1)
  ├── Supermercado (parent_id: 1)
  └── Delivery (parent_id: 1)
```

---

## Metas Financeiras

### RN-MET-001: Criação de Meta

**Regra:**
- nome único por usuário
- valor_objetivo > 0
- valor_atual >= 0
- valor_atual <= valor_objetivo (ou até 110% com flag)
- prazo >= CURRENT_DATE (se informado)

**Validações:**
```
- UNIQUE (usuario_id, LOWER(TRIM(nome)))
- valor_objetivo > 0
- valor_atual >= 0
- valor_atual <= valor_objetivo * 1.1
- prazo IS NULL OR prazo >= CURRENT_DATE
```

**Tipos de Meta:**

1. **ECONOMIZAR**
   - Guardar dinheiro sem propósito específico
   - Aportes frequentes recomendados

2. **QUITAR_DIVIDA**
   - Eliminar dívida existente
   - Tracking de parcelas pagas

3. **INVESTIR**
   - Acumular para investimento
   - Integração futura com corretoras

4. **COMPRA**
   - Comprar item específico
   - Campo adicional: item_desejado

5. **VIAGEM**
   - Juntar para viagem
   - Campos: destino, data_prevista

6. **OUTRO**
   - Objetivo customizado

### RN-MET-002: Aportes em Meta

**Regra:**
- Aporte deve ser > 0
- Resgate deve ser < 0 (valor negativo)
- Não permitir resgate maior que valor_atual
- Atualizar valor_atual e progresso automaticamente

**Processo:**
1. Criar registro em transacoes_meta
2. Trigger atualiza metas.valor_atual
3. Trigger recalcula metas.progresso
4. Se progresso >= 100%: status = 'CONCLUIDA'
5. Enviar notificação de conquista

**Validações:**
```
- tipo = 'APORTE': valor > 0
- tipo = 'RESGATE': valor < 0 AND ABS(valor) <= meta.valor_atual
- tipo = 'AJUSTE': qualquer valor
```

### RN-MET-003: Progresso e Status

**Cálculo de Progresso:**
```sql
progresso = LEAST((valor_atual / valor_objetivo) * 100, 100)
```

**Regras de Status:**

1. **EM_ANDAMENTO**
   - Status inicial
   - progresso < 100%
   - prazo não expirado

2. **CONCLUIDA**
   - progresso >= 100%
   - Transição automática
   - Enviar notificação

3. **PAUSADA**
   - Usuário pode pausar temporariamente
   - Não aparece em alertas de prazo

4. **CANCELADA**
   - Usuário desistiu
   - valor_atual pode ser transferido para outra meta

**Transições Automáticas:**
```
EM_ANDAMENTO → CONCLUIDA (quando progresso >= 100%)
EM_ANDAMENTO → ATRASADA (quando prazo < CURRENT_DATE AND progresso < 100%)
```

### RN-MET-004: Alertas de Prazo

**Regra:**
- Notificar quando faltam 30 dias para prazo
- Notificar quando faltam 7 dias para prazo
- Notificar no dia do prazo
- Se prazo passou e meta não concluída: status → ATRASADA

**Cálculo de Aporte Necessário:**
```
dias_restantes = prazo - CURRENT_DATE
valor_restante = valor_objetivo - valor_atual
aporte_diario_necessario = valor_restante / dias_restantes
```

Notificação:
> "Para atingir sua meta '{nome}' até {prazo}, você precisa aportar R$ {valor} por dia."

### RN-MET-005: Integração com Despesas

**Regra:**
- Permitir vincular despesa a meta (categoria específica)
- Despesas vinculadas reduzem meta automaticamente
- Ex: Meta "Quitar Cartão" + Despesa "Pagamento Cartão"

**Processo:**
```
1. Criar despesa vinculada à meta
2. Ao marcar despesa como PAGA:
   - Criar transacao_meta tipo RESGATE
   - valor = -despesa.valor
   - Atualizar meta.valor_atual
```

---

## Dashboard e Relatórios

### RN-DASH-001: Resumo Financeiro

**Cálculos:**

1. **Total Receitas (Mês)**
   ```sql
   SELECT SUM(salario + auxilios + servicos_extras)
   FROM receitas
   WHERE usuario_id = ?
     AND periodo_inicio <= ultimo_dia_mes
     AND periodo_fim >= primeiro_dia_mes
   ```

2. **Total Despesas (Mês)**
   ```sql
   SELECT SUM(valor)
   FROM despesas
   WHERE usuario_id = ?
     AND EXTRACT(YEAR FROM data) = ?
     AND EXTRACT(MONTH FROM data) = ?
     AND deleted_at IS NULL
   ```

3. **Saldo (Mês)**
   ```
   saldo = total_receitas - total_despesas
   ```

4. **Taxa de Economia**
   ```
   taxa_economia = (saldo / total_receitas) * 100
   ```

**Benchmarks:**
- Excelente: > 30%
- Bom: 20-30%
- Regular: 10-20%
- Ruim: < 10%
- Negativo: < 0%

### RN-DASH-002: Gastos por Categoria

**Regra:**
- Top 10 categorias do mês
- Percentual relativo ao total
- Comparação com mês anterior
- Identificar categorias em crescimento

**Cálculo:**
```sql
SELECT 
  c.nome,
  c.cor,
  SUM(d.valor) as total,
  (SUM(d.valor) / total_despesas_mes) * 100 as percentual,
  COUNT(*) as quantidade
FROM despesas d
JOIN categorias c ON d.categoria_id = c.id
WHERE d.usuario_id = ?
  AND d.data BETWEEN ? AND ?
GROUP BY c.id, c.nome, c.cor
ORDER BY total DESC
LIMIT 10
```

### RN-DASH-003: Evolução Temporal

**Regra:**
- Gráfico de linha: últimos 12 meses
- Duas linhas: Receitas e Despesas
- Área sombreada: saldo (verde positivo, vermelho negativo)
- Marcar mês atual

**Dados:**
```sql
SELECT 
  DATE_TRUNC('month', data) as mes,
  SUM(CASE WHEN tipo = 'RECEITA' THEN valor ELSE 0 END) as receitas,
  SUM(CASE WHEN tipo = 'DESPESA' THEN valor ELSE 0 END) as despesas
FROM (
  -- Union de receitas e despesas
) transacoes
WHERE usuario_id = ?
  AND data >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', data)
ORDER BY mes
```

### RN-DASH-004: Metas em Destaque

**Regra:**
- Mostrar até 3 metas em andamento
- Ordenar por: prioridade DESC, prazo ASC
- Mostrar barra de progresso
- Indicar dias restantes
- Botão rápido para aporte

**Query:**
```sql
SELECT *
FROM metas
WHERE usuario_id = ?
  AND status = 'EM_ANDAMENTO'
ORDER BY prioridade DESC, prazo ASC NULLS LAST
LIMIT 3
```

### RN-DASH-005: Cache de Dashboard

**Regra:**
- TTL: 5 minutos para dados agregados
- Invalidar cache ao criar/editar/deletar transação
- Chave: `dashboard:user:{userId}:mes:{YYYY-MM}`
- Pre-warm cache para mês atual em horários de pico

**Estratégia:**
```
1. Request chega
2. Verificar cache (Caffeine L1 → Redis L2)
3. Se HIT: retornar
4. Se MISS:
   - Executar queries
   - Armazenar em cache
   - Retornar
```

---

## Notificações

### RN-NOT-001: Tipos de Notificação

**Categorias:**

1. **Transacional**
   - Despesa criada
   - Meta concluída
   - Pagamento processado

2. **Alerta**
   - Gasto acima da média
   - Prazo de meta próximo
   - Conta a vencer

3. **Insight IA**
   - Padrão identificado
   - Sugestão de economia
   - Anomalia detectada

4. **Sistema**
   - Manutenção programada
   - Nova funcionalidade
   - Atualização de termos

### RN-NOT-002: Prioridades

| Prioridade | Descrição | Cor | Ícone | Exemplo |
|------------|-----------|-----|-------|---------|
| URGENTE | Requer ação imediata | Vermelho | ⚠️ | Conta vencida |
| ALTA | Importante mas não urgente | Laranja | 🔔 | Meta perto do prazo |
| MEDIA | Informativo relevante | Azul | 💡 | Insight IA |
| BAIXA | FYI | Cinza | ℹ️ | Nova funcionalidade |

### RN-NOT-003: Canais de Entrega

**Regras:**
- URGENTE: Email + Push + In-app
- ALTA: Push + In-app
- MEDIA: In-app (badge)
- BAIXA: In-app (sem badge)

**Frequência:**
- Máximo 5 notificações push/dia
- Digest diário para insights IA (18:00)
- Resumo semanal (domingo 20:00)

### RN-NOT-004: Preferências do Usuário

**Granularidade:**
```json
{
  "canais": {
    "email": true,
    "push": true,
    "sms": false
  },
  "tipos": {
    "transacional": true,
    "alerta": true,
    "insight_ia": true,
    "marketing": false
  },
  "horarios": {
    "inicio": "08:00",
    "fim": "22:00",
    "fuso": "America/Sao_Paulo"
  }
}
```

**Regra:**
- Respeitar preferências EXCETO notificações de segurança
- Notificações críticas sempre enviadas

---

## Inteligência Artificial

### RN-IA-001: Detecção de Anomalias

**Algoritmo:** Isolation Forest

**Regra:**
- Analisar novas despesas em batch (a cada 1h)
- Comparar com padrão histórico (últimos 90 dias)
- Score de anomalia: 0 (normal) a 1 (muito anômalo)
- Threshold: 0.7 para alerta

**Features Consideradas:**
- Valor da despesa (normalizado)
- Dia do mês
- Dia da semana
- Categoria
- Desvio da média histórica
- Frequência da categoria

**Ações:**
```
Se anomaly_score > 0.7:
  1. Criar insight tipo 'ANOMALIA'
  2. Notificação ALTA
  3. Sugerir verificação
  4. Perguntar se foi fraudulenta
```

### RN-IA-002: Previsão de Gastos

**Algoritmo:** Random Forest Regressor

**Regra:**
- Treinar modelo mensalmente com últimos 12 meses
- Prever gastos dos próximos 3 meses
- Detalhar por categoria
- Confidence interval: 80%

**Features:**
- Histórico de gastos (12 meses)
- Sazonalidade (mês do ano)
- Tendência
- Receitas do período
- Eventos especiais (Natal, férias, etc.)

**Output:**
```json
{
  "mes": "2026-02",
  "previsao": {
    "valor": 3250.00,
    "min": 2900.00,
    "max": 3600.00,
    "confianca": 0.85
  },
  "por_categoria": [
    {"categoria": "Alimentação", "valor_previsto": 800},
    {"categoria": "Transporte", "valor_previsto": 600}
  ]
}
```

### RN-IA-003: Categorização Automática

**Algoritmo:** Naive Bayes Multinomial + TF-IDF

**Regra:**
- Treinar com despesas categorizadas manualmente
- Aplicar em novas despesas
- Confidence threshold: 0.75
- Abaixo do threshold: sugerir ao invés de aplicar

**Process:**
```
Nova despesa sem categoria:
1. Extrair features: descrição (TF-IDF)
2. Predict categoria
3. Se confidence > 0.75:
   - Aplicar automaticamente
   - Notificar usuário (pode desfazer)
4. Senão:
   - Sugerir top 3 categorias
   - Usuário escolhe
```

**Feedback Loop:**
- Quando usuário corrige: retreinar modelo
- Incremental learning semanal

### RN-IA-004: Sugestões de Economia

**Regra:**
- Analisar padrões semanalmente
- Identificar oportunidades de redução
- Priorizar por impacto potencial
- Personalizar por perfil do usuário

**Tipos de Sugestão:**

1. **Substituição**
   - "Você gasta R$ 200/mês em delivery. Cozinhar em casa 2x/semana economizaria ~R$ 80."

2. **Negociação**
   - "Seu plano de internet de R$ 150 está acima da média. Considere renegociar."

3. **Elimanção**
   - "Assinatura XYZ (R$ 30/mês) não foi usada nos últimos 60 dias."

4. **Otimização**
   - "Transferir compras do cartão para débito economizaria R$ 15 em juros."

**Cálculo de Impacto:**
```
impacto_anual = economia_mensal * 12
relevancia = impacto_anual / receita_anual
prioridade = relevancia * facilidade_implementacao
```

### RN-IA-005: Metas Inteligentes

**Regra:**
- Sugerir metas baseadas em padrão financeiro
- Calcular valor e prazo realistas
- Ajustar dinamicamente conforme progresso

**Sugestões:**
```
1. Meta de Economia
   - Valor: 10-20% da receita mensal
   - Prazo: 6-12 meses
   
2. Meta de Investimento
   - Se economia > 20% por 3+ meses
   - Sugerir começar a investir
   
3. Meta de Redução de Dívida
   - Priorizar dívidas com juros altos
   - Calcular prazo otimizado
```

---

## Limites e Quotas

### RN-LIM-001: Rate Limiting

**APIs Públicas:**
- Autenticação: 10 req/min por IP
- Registro: 3 req/hour por IP
- Geral autenticado: 100 req/min por usuário

**APIs Internas:**
- Dashboard: 30 req/min
- Crud: 60 req/min
- Export: 5 req/hour

**Implementação:**
- Token Bucket Algorithm
- Armazenamento: Redis
- Headers de resposta:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 87
  X-RateLimit-Reset: 1643723400
  ```

### RN-LIM-002: Quotas por Tipo de Usuário

| Recurso | FREE | PREMIUM | ENTERPRISE |
|---------|------|---------|------------|
| Despesas/mês | 100 | Ilimitado | Ilimitado |
| Receitas/mês | 10 | Ilimitado | Ilimitado |
| Metas simultâneas | 5 | 20 | Ilimitado |
| Categorias custom | 10 | 50 | Ilimitado |
| Anexos/despesa | 1 | 3 | 5 |
| Tamanho anexo | 2MB | 5MB | 10MB |
| Exportações/mês | 3 | 30 | Ilimitado |
| Previsões IA/mês | 0 | 10 | Ilimitado |
| API calls/dia | 0 | 1000 | 10000 |

### RN-LIM-003: Soft Limits

**Regra:**
- Avisar quando atingir 80% do limite
- Permitir exceder em 10% com warning
- Bloquear hard em 110%

**Processo:**
```
uso_atual = count(recurso WHERE usuario_id = ?)
limite = obter_limite(tipo_usuario, recurso)

Se uso_atual >= limite * 0.8:
  - Mostrar banner warning
  - Sugerir upgrade

Se uso_atual >= limite * 1.1:
  - Bloquear criação
  - Mostrar modal upgrade
```

### RN-LIM-004: Retenção de Dados

| Tipo de Dado | FREE | PREMIUM | ENTERPRISE |
|--------------|------|---------|------------|
| Transações | 12 meses | 5 anos | Ilimitado |
| Logs auditoria | 30 dias | 1 ano | 7 anos |
| Insights IA | 3 meses | 1 ano | Ilimitado |
| Backups | 7 dias | 30 dias | 90 dias |

**Processo de Arquivamento:**
- Dados antigos movidos para cold storage
- Read-only via API especial
- Custo adicional para reativação

---

## Validações Cross-Cutting

### RN-VAL-001: Datas

**Regras Globais:**
- Datas passadas: aceitar até 5 anos
- Datas futuras: aceitar até 1 ano (para planejamento)
- Feriados: considerar em cálculos de dias úteis
- Fusos horários: sempre armazenar UTC, converter para exibição

### RN-VAL-002: Valores Monetários

**Regras:**
- Precisão: DECIMAL(12,2)
- Máximo: 9.999.999.999,99
- Mínimo: 0,01
- Arredondar sempre para 2 casas decimais
- Cálculos: usar BigDecimal (Java)

### RN-VAL-003: Textos

**Limites:**
- Nome: 3-100 caracteres
- Descrição: 3-255 caracteres
- Observações: 0-5000 caracteres
- Tags: 1-30 caracteres cada, máx 10 tags

**Sanitização:**
- Trim espaços
- Remover caracteres especiais perigosos
- Escapar HTML
- Validar encodings

---

## Conformidade e Privacidade

### RN-LGPD-001: Consentimento

**Regra:**
- Coletar consentimento explícito para:
  - Processamento de dados financeiros
  - Uso de IA
  - Compartilhamento com parceiros
  - Marketing
- Permitir revogação a qualquer momento
- Registrar histórico de consentimentos

### RN-LGPD-002: Direitos do Titular

**Implementar:**
1. **Acesso**: Exportar todos os dados em JSON
2. **Retificação**: Editar qualquer informação
3. **Exclusão**: Soft delete + anonymização
4. **Portabilidade**: Export em formatos interoperáveis
5. **Oposição**: Opt-out de processamentos específicos

### RN-LGPD-003: Minimização de Dados

**Regra:**
- Coletar apenas dados essenciais
- Não obrigar campos opcionais
- Deletar dados após período de retenção
- Anonimizar para analytics

---

**Última Atualização:** Janeiro 2026  
**Versão:** 2.0  
**Responsável:** Product & Engineering
