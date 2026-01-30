# 🗄️ Database - Modelo de Dados

## Visão Geral

O sistema utiliza **PostgreSQL 16** como banco de dados principal, seguindo os princípios de normalização (3NF), com otimizações estratégicas de desnormalização para performance. A arquitetura de dados foi projetada para suportar multi-tenancy, auditoria completa e escalabilidade.

## Índice

1. [Modelo Conceitual](#modelo-conceitual)
2. [Modelo Lógico](#modelo-lógico)
3. [Modelo Físico](#modelo-físico)
4. [Índices e Otimizações](#índices-e-otimizações)
5. [Constraints e Validações](#constraints-e-validações)
6. [Auditoria e Versionamento](#auditoria-e-versionamento)
7. [Particionamento](#particionamento)
8. [Migrations](#migrations)
9. [Backup e Recovery](#backup-e-recovery)
10. [Performance Tuning](#performance-tuning)

---

## Modelo Conceitual

### Entidades Principais

```
USUÁRIO
  - Representa pessoa física que utiliza o sistema
  - Pode ter múltiplas receitas e despesas
  - Define suas próprias categorias
  - Estabelece metas financeiras

RECEITA
  - Período de referência de ganhos
  - Agrupa despesas do mesmo período
  - Cálculo automático de dias úteis
  - Suporta múltiplas fontes de renda

DESPESA
  - Gastos realizados pelo usuário
  - Vinculada a uma receita (período)
  - Categorização obrigatória
  - Suporte a parcelamento

META
  - Objetivo financeiro do usuário
  - Rastreamento de progresso
  - Histórico de aportes (transações)
  - Cálculo automático de percentual

CATEGORIA
  - Classificação customizável
  - Específica por usuário
  - Hierarquia futura (subcategorias)
  - Tipos: RECEITA ou DESPESA

PARÂMETRO
  - Configurações do sistema
  - Valores globais ou por usuário
  - Flags de features
  - Limites e thresholds
```

### Relacionamentos

```
USUÁRIO 1:N RECEITA
USUÁRIO 1:N DESPESA
USUÁRIO 1:N META
USUÁRIO 1:N CATEGORIA
USUÁRIO 1:N PARÂMETRO

RECEITA 1:N DESPESA
META 1:N TRANSAÇÃO_META
CATEGORIA 1:N DESPESA
```

---

## Modelo Lógico

### Diagrama Entidade-Relacionamento

```
┌──────────────────────────────────────────────────────────────────┐
│                            USUARIOS                              │
├──────────────────────────────────────────────────────────────────┤
│ 🔑 id                    BIGSERIAL    PK                         │
│ 🔒 email                 VARCHAR(255) UNIQUE NOT NULL            │
│    senha_hash            VARCHAR(255) NOT NULL                   │
│    nome                  VARCHAR(100) NOT NULL                   │
│    foto_url              TEXT                                    │
│    tipo_usuario          VARCHAR(20)  NOT NULL DEFAULT 'FREE'    │
│    ativo                 BOOLEAN      DEFAULT TRUE               │
│    email_verificado      BOOLEAN      DEFAULT FALSE              │
│    ultimo_acesso         TIMESTAMP                               │
│    tentativas_login      INTEGER      DEFAULT 0                  │
│    bloqueado_ate         TIMESTAMP                               │
│    preferencias_json     JSONB                                   │
│    created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  │
│    updated_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  │
│    deleted_at            TIMESTAMP                               │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              │ 1:N
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼─────────┐  ┌────────▼────────┐  ┌────────▼─────────┐
│    RECEITAS     │  │    DESPESAS     │  │      METAS       │
├─────────────────┤  ├─────────────────┤  ├──────────────────┤
│ 🔑 id           │  │ 🔑 id           │  │ 🔑 id            │
│ 🔗 usuario_id   │◄─┤ 🔗 usuario_id   │  │ 🔗 usuario_id    │
│    periodo_ini  │  │ 🔗 receita_id   │  │    nome          │
│    periodo_fim  │  │ 🔗 categoria_id │  │    descricao     │
│    dias_uteis   │  │    data         │  │    tipo          │
│    salario      │  │    descricao    │  │    valor_obj     │
│    auxilios     │  │    valor        │  │    valor_atual   │
│    servicos_ext │  │    status       │  │    prazo         │
│    observacoes  │  │    parcela_at   │  │    status        │
│    created_at   │  │    parcela_tot  │  │    progresso     │
│    updated_at   │  │    fim_pag      │  │    observacoes   │
└─────────────────┘  │    observacoes  │  │    cor           │
                     │    recorrente   │  │    icone         │
                     │    anexo_url    │  │    created_at    │
                     │    created_at   │  │    updated_at    │
                     │    updated_at   │  └──────┬───────────┘
                     │    deleted_at   │         │
                     └────────┬────────┘         │ 1:N
                              │                  │
                              │ N:1     ┌────────▼───────────┐
                     ┌────────▼───────┐ │  TRANSACOES_META   │
                     │   CATEGORIAS   │ ├────────────────────┤
                     ├────────────────┤ │ 🔑 id              │
                     │ 🔑 id          │ │ 🔗 meta_id         │
                     │ 🔗 usuario_id  │ │    valor           │
                     │    nome        │ │    data            │
                     │    tipo        │ │    descricao       │
                     │    cor         │ │    tipo            │
                     │    icone       │ │    created_at      │
                     │    ativa       │ └────────────────────┘
                     │    created_at  │
                     └────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                          PARAMETROS                              │
├──────────────────────────────────────────────────────────────────┤
│ 🔑 id                    BIGSERIAL    PK                         │
│ 🔗 usuario_id            BIGINT       FK (nullable - global)     │
│    chave                 VARCHAR(100) UNIQUE NOT NULL            │
│    descricao             TEXT                                    │
│    valor                 TEXT         NOT NULL                   │
│    tipo                  VARCHAR(20)  NOT NULL                   │
│    categoria             VARCHAR(50)                             │
│    ativo                 BOOLEAN      DEFAULT TRUE               │
│    created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  │
│    updated_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      AUDITORIA (Tabela de Log)                   │
├──────────────────────────────────────────────────────────────────┤
│ 🔑 id                    BIGSERIAL    PK                         │
│ 🔗 usuario_id            BIGINT       FK                         │
│    entidade              VARCHAR(50)  NOT NULL                   │
│    entidade_id           BIGINT       NOT NULL                   │
│    acao                  VARCHAR(20)  NOT NULL                   │
│    dados_antigos         JSONB                                   │
│    dados_novos           JSONB                                   │
│    ip_address            VARCHAR(45)                             │
│    user_agent            TEXT                                    │
│    created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     NOTIFICACOES                                 │
├──────────────────────────────────────────────────────────────────┤
│ 🔑 id                    BIGSERIAL    PK                         │
│ 🔗 usuario_id            BIGINT       FK NOT NULL                │
│    tipo                  VARCHAR(50)  NOT NULL                   │
│    titulo                VARCHAR(200) NOT NULL                   │
│    mensagem              TEXT         NOT NULL                   │
│    lida                  BOOLEAN      DEFAULT FALSE              │
│    data_leitura          TIMESTAMP                               │
│    prioridade            VARCHAR(20)  DEFAULT 'MEDIA'            │
│    link_acao             TEXT                                    │
│    metadados             JSONB                                   │
│    created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      INSIGHTS_IA                                 │
├──────────────────────────────────────────────────────────────────┤
│ 🔑 id                    BIGSERIAL    PK                         │
│ 🔗 usuario_id            BIGINT       FK NOT NULL                │
│    tipo                  VARCHAR(50)  NOT NULL                   │
│    categoria             VARCHAR(50)                             │
│    titulo                VARCHAR(200) NOT NULL                   │
│    descricao             TEXT         NOT NULL                   │
│    confianca             DECIMAL(5,2) CHECK (0 <= confianca <=1) │
│    impacto               VARCHAR(20)                             │
│    dados_suporte         JSONB                                   │
│    acao_recomendada      TEXT                                    │
│    valido_ate            TIMESTAMP                               │
│    visualizado           BOOLEAN      DEFAULT FALSE              │
│    aceito                BOOLEAN                                 │
│    created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     PREVISOES_IA                                 │
├──────────────────────────────────────────────────────────────────┤
│ 🔑 id                    BIGSERIAL    PK                         │
│ 🔗 usuario_id            BIGINT       FK NOT NULL                │
│    tipo                  VARCHAR(50)  NOT NULL                   │
│    referencia_mes        INTEGER      NOT NULL                   │
│    referencia_ano        INTEGER      NOT NULL                   │
│    valor_previsto        DECIMAL(12,2) NOT NULL                  │
│    valor_real            DECIMAL(12,2)                           │
│    margem_erro           DECIMAL(5,2)                            │
│    confianca             DECIMAL(5,2)                            │
│    metodo                VARCHAR(50)                             │
│    features_utilizadas   JSONB                                   │
│    created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  │
│    atualizado_em         TIMESTAMP                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Modelo Físico

### Tabela: usuarios

```sql
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    foto_url TEXT,
    tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'FREE' 
        CHECK (tipo_usuario IN ('FREE', 'PREMIUM', 'ENTERPRISE')),
    ativo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    ultimo_acesso TIMESTAMP,
    tentativas_login INTEGER DEFAULT 0,
    bloqueado_ate TIMESTAMP,
    preferencias_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT chk_tentativas CHECK (tentativas_login >= 0 AND tentativas_login <= 10)
);

-- Índices
CREATE UNIQUE INDEX idx_usuarios_email_lower ON usuarios (LOWER(email)) WHERE deleted_at IS NULL;
CREATE INDEX idx_usuarios_ativo ON usuarios (ativo) WHERE ativo = TRUE;
CREATE INDEX idx_usuarios_tipo ON usuarios (tipo_usuario, ativo);
CREATE INDEX idx_usuarios_created ON usuarios (created_at DESC);

-- Índice GIN para busca em preferencias JSON
CREATE INDEX idx_usuarios_preferencias ON usuarios USING GIN (preferencias_json);

-- Comentários
COMMENT ON TABLE usuarios IS 'Usuários do sistema com autenticação e perfil';
COMMENT ON COLUMN usuarios.preferencias_json IS 'Configurações personalizadas: tema, idioma, notificações, etc.';
COMMENT ON COLUMN usuarios.tentativas_login IS 'Contador de tentativas de login falhadas (reset após sucesso)';
```

### Tabela: receitas

```sql
CREATE TABLE receitas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    dias_uteis INTEGER,
    salario DECIMAL(12,2) DEFAULT 0.00 CHECK (salario >= 0),
    auxilios DECIMAL(12,2) DEFAULT 0.00 CHECK (auxilios >= 0),
    servicos_extras DECIMAL(12,2) DEFAULT 0.00 CHECK (servicos_extras >= 0),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_receitas_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT chk_periodo CHECK (periodo_fim >= periodo_inicio),
    CONSTRAINT chk_dias_uteis CHECK (dias_uteis IS NULL OR (dias_uteis >= 0 AND dias_uteis <= 31))
);

-- Índices
CREATE INDEX idx_receitas_usuario ON receitas (usuario_id);
CREATE INDEX idx_receitas_periodo ON receitas (periodo_inicio, periodo_fim);
CREATE INDEX idx_receitas_usuario_periodo ON receitas (usuario_id, periodo_inicio DESC, periodo_fim DESC);

-- Índice para evitar overlap de períodos
CREATE UNIQUE INDEX idx_receitas_periodo_unique ON receitas (
    usuario_id, 
    periodo_inicio, 
    periodo_fim
);

-- Trigger para calcular dias úteis automaticamente
CREATE OR REPLACE FUNCTION calcular_dias_uteis() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.dias_uteis IS NULL THEN
        NEW.dias_uteis := (
            SELECT COUNT(*)
            FROM generate_series(NEW.periodo_inicio, NEW.periodo_fim, '1 day'::interval) AS dia
            WHERE EXTRACT(DOW FROM dia) NOT IN (0, 6) -- Exclui domingo (0) e sábado (6)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calcular_dias_uteis
    BEFORE INSERT OR UPDATE ON receitas
    FOR EACH ROW
    EXECUTE FUNCTION calcular_dias_uteis();

COMMENT ON TABLE receitas IS 'Períodos de receitas com múltiplas fontes de renda';
```

### Tabela: categorias

```sql
CREATE TABLE categorias (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('RECEITA', 'DESPESA')),
    cor VARCHAR(7) DEFAULT '#3B82F6',
    icone VARCHAR(50) DEFAULT 'default',
    ativa BOOLEAN DEFAULT TRUE,
    ordem INTEGER DEFAULT 0,
    parent_id BIGINT, -- Para hierarquia futura
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_categorias_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_categorias_parent FOREIGN KEY (parent_id)
        REFERENCES categorias(id) ON DELETE SET NULL,
    CONSTRAINT uk_categoria_usuario_nome UNIQUE (usuario_id, nome, tipo),
    CONSTRAINT chk_cor_hex CHECK (cor ~* '^#[0-9A-F]{6}$')
);

-- Índices
CREATE INDEX idx_categorias_usuario ON categorias (usuario_id);
CREATE INDEX idx_categorias_tipo ON categorias (tipo, ativa);
CREATE INDEX idx_categorias_usuario_tipo ON categorias (usuario_id, tipo, ativa);
CREATE INDEX idx_categorias_ordem ON categorias (usuario_id, ordem);

-- Índice para hierarquia
CREATE INDEX idx_categorias_parent ON categorias (parent_id) WHERE parent_id IS NOT NULL;

-- Função para inserir categorias padrão
CREATE OR REPLACE FUNCTION criar_categorias_padrao(p_usuario_id BIGINT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO categorias (usuario_id, nome, tipo, cor, icone) VALUES
        (p_usuario_id, 'Alimentação', 'DESPESA', '#EF4444', 'utensils'),
        (p_usuario_id, 'Transporte', 'DESPESA', '#F59E0B', 'car'),
        (p_usuario_id, 'Moradia', 'DESPESA', '#8B5CF6', 'home'),
        (p_usuario_id, 'Saúde', 'DESPESA', '#10B981', 'heart'),
        (p_usuario_id, 'Educação', 'DESPESA', '#3B82F6', 'book'),
        (p_usuario_id, 'Lazer', 'DESPESA', '#EC4899', 'smile'),
        (p_usuario_id, 'Salário', 'RECEITA', '#059669', 'dollar-sign'),
        (p_usuario_id, 'Freelance', 'RECEITA', '#06B6D4', 'briefcase');
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE categorias IS 'Categorias personalizadas para classificação de transações';
```

### Tabela: despesas

```sql
CREATE TABLE despesas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    receita_id BIGINT,
    categoria_id BIGINT NOT NULL,
    data DATE NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(12,2) NOT NULL CHECK (valor > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE'
        CHECK (status IN ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO')),
    parcela_atual INTEGER,
    parcela_total INTEGER,
    fim_pagamento DATE,
    observacoes TEXT,
    recorrente BOOLEAN DEFAULT FALSE,
    tipo_recorrencia VARCHAR(20),
    anexo_url TEXT,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_despesas_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_despesas_receita FOREIGN KEY (receita_id)
        REFERENCES receitas(id) ON DELETE SET NULL,
    CONSTRAINT fk_despesas_categoria FOREIGN KEY (categoria_id)
        REFERENCES categorias(id) ON DELETE RESTRICT,
    CONSTRAINT chk_parcelas CHECK (
        (parcela_atual IS NULL AND parcela_total IS NULL) OR
        (parcela_atual > 0 AND parcela_total > 0 AND parcela_atual <= parcela_total)
    ),
    CONSTRAINT chk_recorrencia CHECK (
        (recorrente = FALSE AND tipo_recorrencia IS NULL) OR
        (recorrente = TRUE AND tipo_recorrencia IN ('DIARIA', 'SEMANAL', 'QUINZENAL', 'MENSAL', 'ANUAL'))
    )
);

-- Índices principais
CREATE INDEX idx_despesas_usuario ON despesas (usuario_id);
CREATE INDEX idx_despesas_data ON despesas (data DESC);
CREATE INDEX idx_despesas_usuario_data ON despesas (usuario_id, data DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_despesas_categoria ON despesas (categoria_id);
CREATE INDEX idx_despesas_receita ON despesas (receita_id);
CREATE INDEX idx_despesas_status ON despesas (status) WHERE status = 'PENDENTE';

-- Índices compostos para queries comuns
CREATE INDEX idx_despesas_usuario_periodo ON despesas (usuario_id, data) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_despesas_categoria_periodo ON despesas (categoria_id, data DESC) 
    WHERE deleted_at IS NULL;

-- Índice parcial para pendentes
CREATE INDEX idx_despesas_pendentes ON despesas (usuario_id, data, valor) 
    WHERE status = 'PENDENTE' AND deleted_at IS NULL;

-- Índice para busca textual
CREATE INDEX idx_despesas_descricao_trgm ON despesas USING GIN (descricao gin_trgm_ops);

-- Índice para tags
CREATE INDEX idx_despesas_tags ON despesas USING GIN (tags) WHERE tags IS NOT NULL;

-- Trigger para atualizar status atrasado
CREATE OR REPLACE FUNCTION atualizar_status_despesas()
RETURNS void AS $$
BEGIN
    UPDATE despesas
    SET status = 'ATRASADO'
    WHERE status = 'PENDENTE' 
      AND data < CURRENT_DATE
      AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE despesas IS 'Despesas realizadas pelos usuários com suporte a parcelamento';
COMMENT ON COLUMN despesas.tags IS 'Tags para busca e filtros adicionais';
```

### Tabela: metas

```sql
CREATE TABLE metas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(30) NOT NULL DEFAULT 'ECONOMIZAR'
        CHECK (tipo IN ('ECONOMIZAR', 'QUITAR_DIVIDA', 'INVESTIR', 'COMPRA', 'VIAGEM', 'OUTRO')),
    valor_objetivo DECIMAL(12,2) NOT NULL CHECK (valor_objetivo > 0),
    valor_atual DECIMAL(12,2) DEFAULT 0.00 CHECK (valor_atual >= 0),
    prazo DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'EM_ANDAMENTO'
        CHECK (status IN ('EM_ANDAMENTO', 'CONCLUIDA', 'PAUSADA', 'CANCELADA')),
    progresso DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN valor_objetivo > 0 THEN LEAST((valor_atual / valor_objetivo) * 100, 100)
            ELSE 0
        END
    ) STORED,
    cor VARCHAR(7) DEFAULT '#3B82F6',
    icone VARCHAR(50) DEFAULT 'target',
    prioridade INTEGER DEFAULT 3 CHECK (prioridade BETWEEN 1 AND 5),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    concluida_em TIMESTAMP,
    
    CONSTRAINT fk_metas_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT chk_valor_atual_objetivo CHECK (valor_atual <= valor_objetivo * 1.1),
    CONSTRAINT chk_prazo_futuro CHECK (prazo IS NULL OR prazo >= CURRENT_DATE)
);

-- Índices
CREATE INDEX idx_metas_usuario ON metas (usuario_id);
CREATE INDEX idx_metas_status ON metas (status);
CREATE INDEX idx_metas_usuario_status ON metas (usuario_id, status);
CREATE INDEX idx_metas_prazo ON metas (prazo) WHERE prazo IS NOT NULL AND status = 'EM_ANDAMENTO';
CREATE INDEX idx_metas_prioridade ON metas (usuario_id, prioridade DESC, created_at DESC);

-- Trigger para atualizar status quando concluída
CREATE OR REPLACE FUNCTION atualizar_status_meta()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.valor_atual >= NEW.valor_objetivo AND OLD.status != 'CONCLUIDA' THEN
        NEW.status := 'CONCLUIDA';
        NEW.concluida_em := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_status_meta
    BEFORE UPDATE ON metas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_status_meta();

COMMENT ON TABLE metas IS 'Metas financeiras dos usuários com tracking de progresso';
COMMENT ON COLUMN metas.progresso IS 'Calculado automaticamente: (valor_atual / valor_objetivo) * 100';
```

### Tabela: transacoes_meta

```sql
CREATE TABLE transacoes_meta (
    id BIGSERIAL PRIMARY KEY,
    meta_id BIGINT NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descricao VARCHAR(255),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('APORTE', 'RESGATE', 'AJUSTE')),
    origem VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_transacoes_meta FOREIGN KEY (meta_id)
        REFERENCES metas(id) ON DELETE CASCADE,
    CONSTRAINT chk_valor_transacao CHECK (
        (tipo = 'APORTE' AND valor > 0) OR
        (tipo = 'RESGATE' AND valor < 0) OR
        (tipo = 'AJUSTE')
    )
);

-- Índices
CREATE INDEX idx_transacoes_meta_id ON transacoes_meta (meta_id);
CREATE INDEX idx_transacoes_data ON transacoes_meta (data DESC);
CREATE INDEX idx_transacoes_meta_data ON transacoes_meta (meta_id, data DESC);
CREATE INDEX idx_transacoes_tipo ON transacoes_meta (tipo);

-- Trigger para atualizar valor atual da meta
CREATE OR REPLACE FUNCTION atualizar_valor_meta()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE metas
    SET valor_atual = valor_atual + NEW.valor,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.meta_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_valor_meta
    AFTER INSERT ON transacoes_meta
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_valor_meta();

COMMENT ON TABLE transacoes_meta IS 'Histórico de aportes e resgates em metas';
```

### Tabela: parametros

```sql
CREATE TABLE parametros (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT,
    chave VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'JSON')),
    categoria VARCHAR(50) DEFAULT 'GERAL',
    ativo BOOLEAN DEFAULT TRUE,
    editavel_usuario BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_parametros_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT uk_parametro_chave UNIQUE (usuario_id, chave)
);

-- Índices
CREATE UNIQUE INDEX idx_parametros_global ON parametros (chave) WHERE usuario_id IS NULL;
CREATE INDEX idx_parametros_usuario ON parametros (usuario_id);
CREATE INDEX idx_parametros_categoria ON parametros (categoria, ativo);

-- Função para obter parâmetro com fallback global
CREATE OR REPLACE FUNCTION obter_parametro(
    p_usuario_id BIGINT,
    p_chave VARCHAR
) RETURNS TEXT AS $$
DECLARE
    v_valor TEXT;
BEGIN
    -- Tenta buscar parâmetro do usuário
    SELECT valor INTO v_valor
    FROM parametros
    WHERE usuario_id = p_usuario_id 
      AND chave = p_chave 
      AND ativo = TRUE;
    
    -- Se não encontrou, busca global
    IF v_valor IS NULL THEN
        SELECT valor INTO v_valor
        FROM parametros
        WHERE usuario_id IS NULL 
          AND chave = p_chave 
          AND ativo = TRUE;
    END IF;
    
    RETURN v_valor;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE parametros IS 'Configurações do sistema (globais e por usuário)';
```

### Tabelas de Auditoria e IA

```sql
-- Auditoria
CREATE TABLE auditoria (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT,
    entidade VARCHAR(50) NOT NULL,
    entidade_id BIGINT NOT NULL,
    acao VARCHAR(20) NOT NULL CHECK (acao IN ('CREATE', 'UPDATE', 'DELETE', 'VIEW')),
    dados_antigos JSONB,
    dados_novos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_auditoria_usuario ON auditoria (usuario_id);
CREATE INDEX idx_auditoria_entidade ON auditoria (entidade, entidade_id);
CREATE INDEX idx_auditoria_acao ON auditoria (acao);
CREATE INDEX idx_auditoria_data ON auditoria (created_at DESC);
CREATE INDEX idx_auditoria_usuario_data ON auditoria (usuario_id, created_at DESC);

-- Particionamento por mês
CREATE TABLE auditoria_2026_01 PARTITION OF auditoria
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- Notificações
CREATE TABLE notificacoes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    data_leitura TIMESTAMP,
    prioridade VARCHAR(20) DEFAULT 'MEDIA' CHECK (prioridade IN ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE')),
    link_acao TEXT,
    metadados JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notificacoes_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_notificacoes_usuario ON notificacoes (usuario_id);
CREATE INDEX idx_notificacoes_nao_lidas ON notificacoes (usuario_id, created_at DESC) 
    WHERE lida = FALSE;
CREATE INDEX idx_notificacoes_prioridade ON notificacoes (usuario_id, prioridade, created_at DESC);

-- Insights de IA
CREATE TABLE insights_ia (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('ECONOMIA', 'ALERTA', 'OPORTUNIDADE', 'PADRAO', 'ANOMALIA')),
    categoria VARCHAR(50),
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    confianca DECIMAL(5,2) CHECK (confianca >= 0 AND confianca <= 1),
    impacto VARCHAR(20) CHECK (impacto IN ('BAIXO', 'MEDIO', 'ALTO')),
    dados_suporte JSONB,
    acao_recomendada TEXT,
    valido_ate TIMESTAMP,
    visualizado BOOLEAN DEFAULT FALSE,
    aceito BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_insights_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_insights_usuario ON insights_ia (usuario_id);
CREATE INDEX idx_insights_tipo ON insights_ia (tipo);
CREATE INDEX idx_insights_nao_visualizados ON insights_ia (usuario_id, created_at DESC) 
    WHERE visualizado = FALSE;
CREATE INDEX idx_insights_validade ON insights_ia (valido_ate) 
    WHERE valido_ate IS NOT NULL AND valido_ate > CURRENT_TIMESTAMP;

-- Previsões de IA
CREATE TABLE previsoes_ia (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('DESPESA_MENSAL', 'RECEITA_MENSAL', 'SALDO', 'CATEGORIA')),
    referencia_mes INTEGER NOT NULL CHECK (referencia_mes BETWEEN 1 AND 12),
    referencia_ano INTEGER NOT NULL CHECK (referencia_ano >= 2020),
    valor_previsto DECIMAL(12,2) NOT NULL,
    valor_real DECIMAL(12,2),
    margem_erro DECIMAL(5,2),
    confianca DECIMAL(5,2),
    metodo VARCHAR(50),
    features_utilizadas JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP,
    
    CONSTRAINT fk_previsoes_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT uk_previsao_unica UNIQUE (usuario_id, tipo, referencia_mes, referencia_ano)
);

CREATE INDEX idx_previsoes_usuario ON previsoes_ia (usuario_id);
CREATE INDEX idx_previsoes_periodo ON previsoes_ia (referencia_ano, referencia_mes);
CREATE INDEX idx_previsoes_tipo ON previsoes_ia (tipo);
CREATE INDEX idx_previsoes_usuario_periodo ON previsoes_ia (usuario_id, referencia_ano DESC, referencia_mes DESC);
```

---

## Índices e Otimizações

### Estratégia de Indexação

#### 1. Índices B-Tree (Padrão)
- Foreign Keys
- Colunas de busca frequente
- Ordenação e range queries

#### 2. Índices Parciais
```sql
-- Apenas registros ativos
CREATE INDEX idx_usuarios_ativos ON usuarios (email) WHERE ativo = TRUE;

-- Apenas despesas pendentes
CREATE INDEX idx_despesas_pendentes ON despesas (usuario_id, data) 
WHERE status = 'PENDENTE' AND deleted_at IS NULL;
```

#### 3. Índices Compostos
```sql
-- Ordem importa! Mais específico → Menos específico
CREATE INDEX idx_despesas_usuario_data_categoria ON despesas 
(usuario_id, data DESC, categoria_id);
```

#### 4. Índices GIN (Para JSON e Arrays)
```sql
CREATE INDEX idx_usuarios_preferencias ON usuarios USING GIN (preferencias_json);
CREATE INDEX idx_despesas_tags ON despesas USING GIN (tags);
```

#### 5. Índices para Full-Text Search
```sql
-- Extensão necessária
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Busca por similaridade
CREATE INDEX idx_despesas_descricao_trgm ON despesas 
USING GIN (descricao gin_trgm_ops);
```

### Covering Indexes

```sql
-- Índice que "cobre" toda a query (INCLUDE)
CREATE INDEX idx_despesas_covering ON despesas (usuario_id, data) 
INCLUDE (descricao, valor, status);
```

---

## Constraints e Validações

### Check Constraints

```sql
-- Valores numéricos válidos
CHECK (valor > 0)
CHECK (salario >= 0)

-- Datas lógicas
CHECK (periodo_fim >= periodo_inicio)
CHECK (prazo IS NULL OR prazo >= CURRENT_DATE)

-- Enumerações
CHECK (status IN ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO'))
CHECK (tipo IN ('ECONOMIZAR', 'QUITAR_DIVIDA', 'INVESTIR'))

-- Lógica de negócio
CHECK (parcela_atual <= parcela_total)
CHECK (valor_atual <= valor_objetivo * 1.1) -- 10% tolerância
```

### Foreign Key Constraints

```sql
-- Cascade: Deleta registros dependentes
FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE

-- Set Null: Mantém registro mas limpa FK
FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE SET NULL

-- Restrict: Impede deleção se houver dependentes
FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
```

### Unique Constraints

```sql
-- Email único (case-insensitive)
CREATE UNIQUE INDEX idx_usuarios_email_lower ON usuarios (LOWER(email));

-- Categoria única por usuário
CONSTRAINT uk_categoria_usuario_nome UNIQUE (usuario_id, nome, tipo);

-- Prevenção de períodos sobrepostos
CONSTRAINT uk_receita_periodo UNIQUE (usuario_id, periodo_inicio, periodo_fim);
```

---

## Auditoria e Versionamento

### Soft Delete Pattern

```sql
-- Coluna deleted_at em tabelas importantes
deleted_at TIMESTAMP

-- Queries sempre filtram
WHERE deleted_at IS NULL

-- "Deletar" = marcar timestamp
UPDATE despesas SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?;
```

### Trigger de Auditoria

```sql
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO auditoria (
        usuario_id, entidade, entidade_id, acao, 
        dados_antigos, dados_novos, ip_address
    ) VALUES (
        COALESCE(NEW.usuario_id, OLD.usuario_id),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
        inet_client_addr()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar em tabelas críticas
CREATE TRIGGER trg_audit_despesas
    AFTER INSERT OR UPDATE OR DELETE ON despesas
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

### Versionamento Temporal

```sql
-- Para rastreamento de mudanças históricas
CREATE TABLE despesas_historico (
    hist_id BIGSERIAL PRIMARY KEY,
    hist_tipo VARCHAR(10), -- INSERT, UPDATE, DELETE
    hist_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Todas as colunas da tabela original
    id BIGINT,
    usuario_id BIGINT,
    -- ...
);
```

---

## Particionamento

### Por Data (Range Partitioning)

```sql
-- Tabela mestre
CREATE TABLE auditoria (
    -- colunas
) PARTITION BY RANGE (created_at);

-- Partições mensais
CREATE TABLE auditoria_2026_01 PARTITION OF auditoria
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE auditoria_2026_02 PARTITION OF auditoria
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Partição default para dados fora do range
CREATE TABLE auditoria_default PARTITION OF auditoria DEFAULT;
```

**Benefícios:**
- Queries mais rápidas (scan apenas partições relevantes)
- Manutenção facilitada (drop partições antigas)
- Melhor gerenciamento de storage

### Por Hash (Distribuição Uniforme)

```sql
CREATE TABLE despesas (
    -- colunas
) PARTITION BY HASH (usuario_id);

-- 4 partições
CREATE TABLE despesas_p0 PARTITION OF despesas FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE despesas_p1 PARTITION OF despesas FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE despesas_p2 PARTITION OF despesas FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE despesas_p3 PARTITION OF despesas FOR VALUES WITH (MODULUS 4, REMAINDER 3);
```

---

## Migrations

### Flyway Migration Strategy

```
db/migration/
├── V1__create_usuarios_table.sql
├── V2__create_receitas_table.sql
├── V3__create_despesas_table.sql
├── V4__create_metas_table.sql
├── V5__create_categorias_table.sql
├── V6__create_transacoes_meta_table.sql
├── V7__create_parametros_table.sql
├── V8__create_auditoria_tables.sql
├── V9__create_ia_tables.sql
├── V10__create_indexes.sql
├── V11__create_triggers.sql
├── V12__insert_initial_data.sql
└── V13__add_soft_delete_columns.sql
```

### Padrão de Nomenclatura

```
V{version}__{description}.sql

Exemplos:
V1__create_usuarios_table.sql
V2.1__add_email_verification.sql
V3__ALTER_despesas_add_tags.sql
```

### Rollback Strategy

```sql
-- Migrations devem ser reversíveis quando possível
-- V14__add_column_exemplo.sql
ALTER TABLE usuarios ADD COLUMN exemplo VARCHAR(50);

-- V14_undo_add_column_exemplo.sql (rollback)
ALTER TABLE usuarios DROP COLUMN exemplo;
```

---

## Backup e Recovery

### Estratégia de Backup

#### 1. Backup Completo (Full)
```bash
# Diário às 02:00 AM
pg_dump -U usuario -h host -d financeiro_db \
    -F c -b -v -f backup_full_$(date +%Y%m%d).dump
```

#### 2. Backup Incremental (WAL)
```bash
# Continuous archiving
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'
wal_level = replica
```

#### 3. Backup Lógico (Schemas)
```bash
# Apenas estrutura
pg_dump -s -d financeiro_db -f schema_backup.sql

# Apenas dados
pg_dump -a -d financeiro_db -f data_backup.sql
```

### Point-in-Time Recovery (PITR)

```bash
# Restore até timestamp específico
pg_restore -d financeiro_db \
    --clean --if-exists \
    -t '2026-01-30 14:30:00' \
    backup_full.dump
```

### Retenção de Backups

```
├── Diário: 7 dias
├── Semanal: 4 semanas
├── Mensal: 12 meses
└── Anual: 3 anos
```

---

## Performance Tuning

### Configurações PostgreSQL

```ini
# postgresql.conf

# Memory
shared_buffers = 2GB                  # 25% da RAM
effective_cache_size = 6GB            # 75% da RAM
work_mem = 64MB                       # Por operação de sort
maintenance_work_mem = 512MB

# Checkpoints
checkpoint_completion_target = 0.9
wal_buffers = 16MB
max_wal_size = 4GB
min_wal_size = 1GB

# Planner
random_page_cost = 1.1                # Para SSD
effective_io_concurrency = 200        # Para SSD
default_statistics_target = 100

# Connections
max_connections = 100
```

### Query Optimization

#### EXPLAIN ANALYZE
```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT d.*, c.nome as categoria_nome
FROM despesas d
INNER JOIN categorias c ON d.categoria_id = c.id
WHERE d.usuario_id = 123
  AND d.data >= '2026-01-01'
ORDER BY d.data DESC
LIMIT 20;
```

#### Vacuum e Analyze
```sql
-- Automático
autovacuum = on
autovacuum_max_workers = 3

-- Manual quando necessário
VACUUM ANALYZE despesas;
```

#### Monitoramento de Queries Lentas

```sql
-- pg_stat_statements
CREATE EXTENSION pg_stat_statements;

-- Top 10 queries mais lentas
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Materialized Views

```sql
-- Para relatórios complexos
CREATE MATERIALIZED VIEW mv_resumo_mensal AS
SELECT 
    usuario_id,
    DATE_TRUNC('month', data) as mes,
    categoria_id,
    SUM(valor) as total,
    COUNT(*) as quantidade,
    AVG(valor) as media
FROM despesas
WHERE deleted_at IS NULL
GROUP BY usuario_id, DATE_TRUNC('month', data), categoria_id;

-- Índice na MV
CREATE INDEX idx_mv_resumo_usuario_mes ON mv_resumo_mensal (usuario_id, mes);

-- Refresh periódico
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_resumo_mensal;
```

---

## Próximos Passos

### Roadmap de Database

1. **Implementar TimescaleDB** para séries temporais
2. **Adicionar Full-Text Search** avançado
3. **Implementar Sharding** por usuario_id
4. **Criar Data Warehouse** para analytics
5. **Adicionar CDC** (Change Data Capture) para eventos

---

**Última Atualização:** Janeiro 2026  
**Versão:** 2.0  
**Responsável:** Database Architecture
