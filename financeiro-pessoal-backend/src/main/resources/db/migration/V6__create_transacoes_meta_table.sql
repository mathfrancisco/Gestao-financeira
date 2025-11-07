CREATE TABLE transacoes_meta (
    id BIGSERIAL PRIMARY KEY,
    meta_id BIGINT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descricao VARCHAR(255),
    tipo VARCHAR(20) DEFAULT 'APORTE' CHECK (tipo IN ('APORTE', 'RESGATE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transacoes_meta FOREIGN KEY (meta_id) REFERENCES metas(id) ON DELETE CASCADE
);

CREATE INDEX idx_transacoes_meta ON transacoes_meta(meta_id, data DESC);
