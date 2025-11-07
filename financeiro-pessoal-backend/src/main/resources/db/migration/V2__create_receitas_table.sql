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
