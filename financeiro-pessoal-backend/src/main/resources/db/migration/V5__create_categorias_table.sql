CREATE TABLE categorias (
                            id BIGSERIAL PRIMARY KEY,
                            usuario_id BIGINT NOT NULL,
                            nome VARCHAR(100) NOT NULL,
                            tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('RECEITA', 'DESPESA')),
                            ativa BOOLEAN DEFAULT TRUE,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            CONSTRAINT fk_categorias_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                            CONSTRAINT uk_categoria_usuario_nome UNIQUE (usuario_id, nome)
);

CREATE INDEX idx_categorias_usuario_tipo ON categorias(usuario_id, tipo, ativa);
