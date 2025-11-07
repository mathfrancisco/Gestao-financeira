CREATE TABLE despesas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    receita_id BIGINT,
    categoria_id BIGINT,
    data DATE NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PAGO', 'VENCIDO')),
    parcela_atual INTEGER DEFAULT 1,
    parcela_total INTEGER DEFAULT 1,
    fim_pagamento DATE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_despesas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_despesas_receita FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE SET NULL
);

CREATE INDEX idx_despesas_usuario_data ON despesas(usuario_id, data DESC);
CREATE INDEX idx_despesas_status ON despesas(status);
CREATE INDEX idx_despesas_pendentes ON despesas(usuario_id, data) WHERE status = 'PENDENTE';
