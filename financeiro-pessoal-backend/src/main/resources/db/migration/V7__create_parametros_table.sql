CREATE TABLE parametros (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    chave VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    valor VARCHAR(500),
    tipo VARCHAR(20) DEFAULT 'STRING' CHECK (tipo IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_parametros_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT uk_parametro_usuario_chave UNIQUE (usuario_id, chave)
);