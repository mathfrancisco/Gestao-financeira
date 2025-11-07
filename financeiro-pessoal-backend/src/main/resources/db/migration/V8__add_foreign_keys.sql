-- Adicionar FK de categoria em despesas
ALTER TABLE despesas
ADD CONSTRAINT fk_despesas_categoria
FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL;

CREATE INDEX idx_despesas_categoria ON despesas(categoria_id);
