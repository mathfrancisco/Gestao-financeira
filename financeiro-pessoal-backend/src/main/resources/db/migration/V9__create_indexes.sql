-- Índices adicionais para performance
CREATE INDEX idx_despesas_receita ON despesas(receita_id);
CREATE INDEX idx_receitas_usuario ON receitas(usuario_id);
CREATE INDEX idx_metas_usuario ON metas(usuario_id);
CREATE INDEX idx_categorias_usuario ON categorias(usuario_id);
