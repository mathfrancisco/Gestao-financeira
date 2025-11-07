CREATE TABLE metas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) DEFAULT 'ECONOMIA' CHECK (tipo IN ('ECONOMIA', 'INVESTIMENTO', 'COMPRA')),
    valor_objetivo DECIMAL(10,2) NOT NULL,
    valor_atual DECIMAL(10,2) DEFAULT 0.00,
    prazo DATE,
    status VARCHAR(20) DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA')),
    progresso DECIMAL(5,2) DEFAULT 0.00,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_metas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_metas_usuario_status ON metas(usuario_id, status) WHERE status != 'CONCLUIDA';
