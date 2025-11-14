-- ============================================
-- DADOS FINANCEIROS - USUÁRIO ID 1
-- Período: 21/OUT/2025 - 20/NOV/2025
-- PostgreSQL Compatible
-- ============================================

-- ============================================
-- 1. CATEGORIAS
-- ============================================

INSERT INTO categorias (usuario_id, nome, tipo, ativa, created_at, updated_at)
VALUES
(1, 'Moradia', 'DESPESA', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Celular', 'DESPESA', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Transporte', 'DESPESA', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Mercado', 'DESPESA', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Alimentação', 'DESPESA', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Assinatura', 'DESPESA', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Compra Online', 'DESPESA', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Cartao', 'DESPESA', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Faculdade', 'DESPESA', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Pessoal', 'DESPESA', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Roupa', 'DESPESA', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (usuario_id, nome) DO NOTHING;

-- ============================================
-- 2. RECEITA (Período 21/OUT/2025 - 20/NOV/2025)
-- ============================================

INSERT INTO receitas (
    usuario_id,
    periodo_inicio,
    periodo_fim,
    dias_uteis,
    salario,
    auxilios,
    servicos_extras,
    observacoes,
    created_at,
    updated_at
) VALUES (
    1,
    '2025-10-21',
    '2025-11-20',
    23,
    2760.00,
    150.00,
    330.00,
    'Estágio + Auxílio Home Office + Serviços Extras',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) RETURNING id;

-- ============================================
-- 3. DESPESAS DO PERÍODO
-- ============================================
-- Inserir todas as despesas de uma vez
INSERT INTO despesas (
    usuario_id,
    receita_id,
    categoria_id,
    data,
    descricao,
    valor,
    status,
    parcela_atual,
    parcela_total,
    fim_pagamento,
    observacoes,
    created_at,
    updated_at
)
SELECT
    1 as usuario_id,
    (SELECT id FROM receitas WHERE usuario_id = 1 AND periodo_inicio = '2025-10-21' ORDER BY id DESC LIMIT 1) as receita_id,
    c.id as categoria_id,
    d.data::DATE,
    d.descricao,
    d.valor,
    d.status::VARCHAR,
    d.parcela_atual,
    d.parcela_total,
    d.fim_pagamento::DATE,
    d.observacoes,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
FROM (
    VALUES
        ('Moradia', '2025-10-05', 'Parcela Apartamento', 850.00, 'PAGO', 44, 60, NULL, 'Fixa mensal'),
        ('Celular', '2025-10-06', 'Parcela iPhone', 432.00, 'PAGO', 10, 15, '2026-03-31', 'Fixa até Mar/26'),
        ('Transporte', '2025-10-10', 'Gasolina', 100.00, 'PAGO', 1, 1, NULL, 'Variável'),
        ('Mercado', '2025-10-12', 'Supermercado', 22.73, 'PAGO', 1, 1, NULL, 'Média mensal'),
        ('Alimentação', '2025-10-14', 'Ifood', 75.69, 'PAGO', 1, 1, NULL, NULL),
        ('Assinatura', '2025-10-18', 'Mercado Livre', 9.00, 'PAGO', 1, 1, NULL, 'Mensal'),
        ('Assinatura', '2025-10-26', 'YouTube', 16.00, 'PAGO', 1, 1, NULL, 'Premium mensal'),
        ('Compra Online', '2025-10-27', 'Amazon', 83.00, 'PAGO', 1, 1, NULL, 'Última parcela'),
        ('Cartao', '2025-10-28', 'Nubank', 335.14, 'PAGO', 1, 1, NULL, 'Sobrou da fatura passada'),
        ('Faculdade', '2025-10-29', 'Unifeob', 144.20, 'PAGO', 1, 1, NULL, 'Mensal'),
        ('Alimentação', '2025-10-30', 'Pizzaria', 93.00, 'PAGO', 1, 1, NULL, NULL),
        ('Transporte', '2025-10-31', 'Gasolina', 30.00, 'PAGO', 1, 1, NULL, NULL),
        ('Transporte', '2025-11-01', 'Óleo Carro', 32.00, 'PAGO', 1, 1, NULL, NULL),
        ('Alimentação', '2025-11-02', 'Mercado Livre', 75.00, 'PAGO', 1, 1, NULL, NULL),
        ('Alimentação', '2025-11-03', 'Ifood', 22.00, 'PAGO', 1, 1, NULL, NULL),
        ('Roupa', '2025-11-04', 'Hering', 207.00, 'PAGO', 1, 1, NULL, NULL)
) AS d(categoria_nome, data, descricao, valor, status, parcela_atual, parcela_total, fim_pagamento, observacoes)
JOIN categorias c ON c.nome = d.categoria_nome AND c.usuario_id = 1;

-- ============================================
-- 4. META (Viagem de Férias)
-- ============================================

INSERT INTO metas (
    usuario_id,
    nome,
    descricao,
    tipo,
    valor_objetivo,
    valor_atual,
    prazo,
    status,
    progresso,
    observacoes,
    created_at,
    updated_at
) VALUES (
    1,
    'Viagem de Férias',
    'Meta para viagem de férias',
    'COMPRA',
    3000.00,
    450.00,
    '2026-12-20',
    'EM_ANDAMENTO',
    15.00,
    'Economizando para viagem',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================
-- 5. PARÂMETROS (Valores de Referência)
-- ============================================

INSERT INTO parametros (usuario_id, chave, descricao, valor, tipo, created_at, updated_at)
VALUES
(1, 'valor_dia_estagio', 'Valor diário do estágio', '120.00', 'NUMBER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'auxilio_home_office', 'Auxílio home office mensal', '150.00', 'NUMBER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'parcela_apartamento', 'Valor fixo da parcela do apartamento', '850.00', 'NUMBER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'parcela_iphone', 'Valor fixo da parcela do iPhone', '432.00', 'NUMBER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (usuario_id, chave) DO UPDATE
SET valor = EXCLUDED.valor, updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- VERIFICAÇÕES E RELATÓRIOS
-- ============================================

-- Total de despesas por categoria
SELECT
    c.nome as categoria,
    COUNT(d.id) as quantidade,
    SUM(d.valor) as total
FROM despesas d
JOIN categorias c ON d.categoria_id = c.id
WHERE d.usuario_id = 1
AND d.receita_id = (SELECT id FROM receitas WHERE usuario_id = 1 AND periodo_inicio = '2025-10-21' ORDER BY id DESC LIMIT 1)
GROUP BY c.nome
ORDER BY total DESC;

-- Resumo geral do período
WITH receita_atual AS (
    SELECT * FROM receitas
    WHERE usuario_id = 1 AND periodo_inicio = '2025-10-21'
    ORDER BY id DESC LIMIT 1
),
totais AS (
    SELECT
        r.salario + r.auxilios + r.servicos_extras as total_receitas,
        COALESCE(SUM(d.valor), 0) as total_despesas
    FROM receita_atual r
    LEFT JOIN despesas d ON d.receita_id = r.id
    GROUP BY r.salario, r.auxilios, r.servicos_extras
)
SELECT
    total_receitas as "Total Receitas (R$)",
    total_despesas as "Total Despesas (R$)",
    (total_receitas - total_despesas) as "Saldo (R$)",
    ROUND((total_despesas / total_receitas * 100), 2) as "% Gasto"
FROM totais;

-- Despesas parceladas em andamento
SELECT
    data,
    descricao,
    valor,
    CONCAT(parcela_atual, '/', parcela_total) as parcela,
    fim_pagamento,
    observacoes
FROM despesas
WHERE usuario_id = 1
AND parcela_total > 1
AND parcela_atual < parcela_total
ORDER BY data DESC;

-- Status da meta
SELECT
    nome as "Meta",
    CONCAT('R$ ', TO_CHAR(valor_objetivo, 'FM999,999.00')) as "Objetivo",
    CONCAT('R$ ', TO_CHAR(valor_atual, 'FM999,999.00')) as "Atual",
    CONCAT(progresso, '%') as "Progresso",
    status as "Status",
    prazo as "Prazo"
FROM metas
WHERE usuario_id = 1;

-- ============================================
-- MENSAGEM DE SUCESSO
-- ============================================

DO $$
DECLARE
    v_total_despesas DECIMAL(10,2);
    v_total_receitas DECIMAL(10,2);
    v_saldo DECIMAL(10,2);
BEGIN
    SELECT
        SUM(d.valor),
        (SELECT salario + auxilios + servicos_extras
         FROM receitas
         WHERE usuario_id = 1 AND periodo_inicio = '2025-10-21'
         ORDER BY id DESC LIMIT 1)
    INTO v_total_despesas, v_total_receitas
    FROM despesas d
    WHERE d.usuario_id = 1
    AND d.receita_id = (SELECT id FROM receitas WHERE usuario_id = 1 AND periodo_inicio = '2025-10-21' ORDER BY id DESC LIMIT 1);

    v_saldo := v_total_receitas - v_total_despesas;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'DADOS INSERIDOS COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Período: 21/OUT/2025 - 20/NOV/2025';
    RAISE NOTICE 'Total Receitas: R$ %', TO_CHAR(v_total_receitas, 'FM999,999.00');
    RAISE NOTICE 'Total Despesas: R$ %', TO_CHAR(v_total_despesas, 'FM999,999.00');
    RAISE NOTICE 'Saldo: R$ %', TO_CHAR(v_saldo, 'FM999,999.00');
    RAISE NOTICE '========================================';
END $$;