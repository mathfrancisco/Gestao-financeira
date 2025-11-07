# Diagrama de Criação de Despesas

## Visão Geral

Este documento detalha o fluxo completo de criação, atualização, listagem e exclusão de despesas no sistema.

## Fluxo Completo: Criar Despesa

┌──────┐ ┌──────────┐
│Client│ │ Backend │
└──┬───┘ └────┬─────┘
│ │
│ 1. Usuário preenche formulário de despesa │
│ │
│ POST /api/despesas │
│ Headers: Authorization: Bearer {token} │
│ { │
│ "data": "2025-11-07", │
│ "categoriaId": 5, │
│ "descricao": "Aluguel Novembro", │
│ "valor": 1200.00, │
│ "status": "PENDENTE", │
│ "parcelaAtual": 1, │
│ "parcelaTotal": 1, │
│ "observacoes": "Vencimento dia 10" │
│ } │
├──────────────────────────────────────────────────────────────────>│
│ │
│ ┌──────────────────────┐ │
│ │ JwtAuthFilter │ │
│ │ - Valida JWT │ │
│ │ - Extrai usuário │ │
│ └──────────┬───────────┘ │
│ │ │
│ ┌──────────▼───────────┐ │
│ │ DespesaController │ │
│ │ - criar(@Valid DTO) │ │
│ └──────────┬───────────┘ │
│ │ │
│ │ 2. Valida DTO │
│ │ (@NotNull, @Min) │
│ │ │
│ ┌──────────▼───────────┐ │
│ │ DespesaService │ │
│ │ - salvarDespesa() │ │
│ └──────────┬───────────┘ │
│ │ │
│ │ 3. Valida categoria │
│ ┌──────────▼───────────┐ │
│ │ CategoriaRepository │ │
│ │ - findById() │ │
│ └──────────┬───────────┘ │
│ │ │
│ ┌────────────────▼────────────┐ │
│ │ Categoria existe e ativa? │ │
│ └──┬─────────────────────┬────┘ │
│ │ │ │
│ NÃO│ │SIM │
│ │ │ │
│ ┌────────▼────────┐ ┌────────▼───────────┐ │
│ │ ResourceNot │ │ 4. Cria entidade │ │
│ │ FoundException │ │ Despesa │ │
│ └─────────────────┘ └────────┬───────────┘ │
│ │ │
│ ┌────────▼───────────┐ │
│ │ DespesaMapper │ │
│ │ - toEntity() │ │
│ └────────┬───────────┘ │
│ │ │
│ │ 5. Associa │
│ │ usuário │
│ ┌────────▼───────────┐ │
│ │ despesa.setUsuario │ │
│ │ (usuarioLogado) │ │
│ └────────┬───────────┘ │
│ │ │
│ │ 6. Salva no │
│ │ banco │
│ ┌────────▼───────────┐ │
│ │ DespesaRepository │ │
│ │ - save() │ │
│ └────────┬───────────┘ │
│ │ │
│ ┌────────▼───────────┐ │
│ │ PostgreSQL │ │
│ │ INSERT INTO despesas│
│ └────────┬───────────┘ │
│ │ │
│ │ 7. Retorna │
│ │ entidade │
│ ┌────────▼───────────┐ │
│ │ DespesaMapper │ │
│ │ - toResponseDTO() │ │
│ └────────┬───────────┘ │
│ │ │
│ │ 8. Invalida │
│ │ cache │
│ ┌────────▼───────────┐ │
│ │ CacheService │ │
│ │ - evictDashboard() │ │
│ └────────┬───────────┘ │
│ │ │
│ HTTP 201 Created │
│ { │
│ "id": 123, │
│ "data": "2025-11-07", │
│ "categoria": { │
│ "id": 5, │
│ "nome": "Moradia" │
│ }, │
│ "descricao": "Aluguel Novembro", │
│ "valor": 1200.00, │
│ "status": "PENDENTE", │
│ "parcelaAtual": 1, │
│ "parcelaTotal": 1, │
│ "observacoes": "Vencimento dia 10", │
│ "createdAt": "2025-11-07T14:30:00Z" │
│ } │
│<──────────────────────────────────────────────────────────────────┤
│ │
│ 9. Frontend atualiza lista de despesas │
│ │

text

## Fluxo: Listar Despesas com Paginação

┌──────┐ ┌──────────┐
│Client│ │ Backend │
└──┬───┘ └────┬─────┘
│ │
│ GET /api/despesas?page=0&size=20&sort=data,desc │
│ Headers: Authorization: Bearer {token} │
├──────────────────────────────────────────────────────>│
│ │
│ ┌──────────────────┐ │
│ │ DespesaController│ │
│ │ - listar() │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 1. Cria Pageable │
│ │ │
│ ┌────────▼─────────┐ │
│ │ DespesaService │ │
│ │ - listar() │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 2. Query no banco │
│ ┌────────▼─────────┐ │
│ │DespesaRepository │ │
│ │- findByUsuarioId │ │
│ │ (usuarioId, │ │
│ │ pageable) │ │
│ └────────┬─────────┘ │
│ │ │
│ ┌────────▼─────────┐ │
│ │ PostgreSQL │ │
│ │ SELECT * FROM │ │
│ │ despesas │ │
│ │ WHERE usuario_id │ │
│ │ ORDER BY data DESC│ │
│ │ LIMIT 20 OFFSET 0│ │
│ └────────┬─────────┘ │
│ │ │
│ │ 3. Map para DTO │
│ ┌────────▼─────────┐ │
│ │ DespesaMapper │ │
│ │ - toResponseDTO()│ │
│ └────────┬─────────┘ │
│ │ │
│ HTTP 200 OK │
│ { │
│ "content": [ │
│ { │
│ "id": 123, │
│ "data": "2025-11-07", │
│ "descricao": "Aluguel", │
│ "valor": 1200.00, │
│ "status": "PENDENTE" │
│ }, │
│ ... │
│ ], │
│ "page": 0, │
│ "size": 20, │
│ "totalElements": 145, │
│ "totalPages": 8, │
│ "first": true, │
│ "last": false │
│ } │
│<──────────────────────────────────────────────────────┤
│ │

text

## Fluxo: Atualizar Despesa

┌──────┐ ┌──────────┐
│Client│ │ Backend │
└──┬───┘ └────┬─────┘
│ │
│ PUT /api/despesas/123 │
│ Headers: Authorization: Bearer {token} │
│ { │
│ "status": "PAGO", │
│ "valor": 1200.00 │
│ } │
├──────────────────────────────────────────────────────>│
│ │
│ ┌──────────────────┐ │
│ │ DespesaController│ │
│ │ - atualizar() │ │
│ └────────┬─────────┘ │
│ │ │
│ ┌────────▼─────────┐ │
│ │ DespesaService │ │
│ │ - atualizar() │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 1. Busca despesa │
│ ┌────────▼─────────┐ │
│ │DespesaRepository │ │
│ │- findByIdAnd │ │
│ │ UsuarioId() │ │
│ └────────┬─────────┘ │
│ │ │
│ ┌─────────────▼──────────┐ │
│ │ Despesa existe e │ │
│ │ pertence ao usuário? │ │
│ └──┬──────────────────┬──┘ │
│ │ │ │
│ NÃO│ │SIM │
│ │ │ │
│ ┌────────▼────────┐ ┌──────▼──────┐ │
│ │ HTTP 404 │ │ 2. Atualiza │ │
│ │ Not Found │ │ campos │ │
│ └─────────────────┘ └──────┬──────┘ │
│ │ │
│ ┌────────▼─────────┐ │
│ │ despesa.setStatus│ │
│ │ despesa.setValor │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 3. Salva │
│ ┌────────▼─────────┐ │
│ │DespesaRepository │ │
│ │ - save() │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 4. Invalida │
│ │ cache │
│ ┌────────▼─────────┐ │
│ │ @CacheEvict │ │
│ └────────┬─────────┘ │
│ │ │
│ HTTP 200 OK │
│ { despesa atualizada } │
│<──────────────────────────────────────────────────────┤
│ │

text

## Fluxo: Deletar Despesa

┌──────┐ ┌──────────┐
│Client│ │ Backend │
└──┬───┘ └────┬─────┘
│ │
│ DELETE /api/despesas/123 │
│ Headers: Authorization: Bearer {token} │
├──────────────────────────────────────────────────────>│
│ │
│ ┌──────────────────┐ │
│ │ DespesaController│ │
│ │ - deletar() │ │
│ └────────┬─────────┘ │
│ │ │
│ ┌────────▼─────────┐ │
│ │ DespesaService │ │
│ │ - deletar() │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 1. Verifica │
│ │ propriedade │
│ ┌────────▼─────────┐ │
│ │DespesaRepository │ │
│ │- existsByIdAnd │ │
│ │ UsuarioId() │ │
│ └────────┬─────────┘ │
│ │ │
│ ┌─────────────▼──────────┐ │
│ │ Existe e pertence? │ │
│ └──┬──────────────────┬──┘ │
│ │ │ │
│ NÃO│ │SIM │
│ │ │ │
│ ┌────────▼────────┐ ┌──────▼──────┐ │
│ │ HTTP 404 │ │ 2. Deleta │ │
│ │ Not Found │ │ despesa │ │
│ └─────────────────┘ └──────┬──────┘ │
│ │ │
│ ┌────────▼─────────┐ │
│ │DespesaRepository │ │
│ │ - deleteById() │ │
│ └────────┬─────────┘ │
│ │ │
│ ┌────────▼─────────┐ │
│ │ PostgreSQL │ │
│ │ DELETE FROM │ │
│ │ despesas │ │
│ │ WHERE id = 123 │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 3. Invalida │
│ │ cache │
│ ┌────────▼─────────┐ │
│ │ @CacheEvict │ │
│ └──────────────────┘ │
│ │
│ HTTP 204 No Content │
│<──────────────────────────────────────────────────────┤
│ │

text

## Validações Implementadas

### Bean Validation (Backend)

public class DespesaRequestDTO {

text
@NotNull(message = "Data é obrigatória")
@PastOrPresent(message = "Data não pode ser futura")
private LocalDate data;

@NotNull(message = "Categoria é obrigatória")
@Positive(message = "ID da categoria deve ser positivo")
private Long categoriaId;

@NotBlank(message = "Descrição é obrigatória")
@Size(max = 200, message = "Descrição deve ter no máximo 200 caracteres")
private String descricao;

@NotNull(message = "Valor é obrigatório")
@DecimalMin(value = "0.01", message = "Valor deve ser maior que zero")
@Digits(integer = 10, fraction = 2, message = "Formato de valor inválido")
private BigDecimal valor;

@NotNull(message = "Status é obrigatório")
@Enumerated(EnumType.STRING)
private StatusPagamento status;

@Min(value = 1, message = "Parcela atual deve ser maior que zero")
private Integer parcelaAtual;

@Min(value = 1, message = "Parcela total deve ser maior que zero")
private Integer parcelaTotal;

@Size(max = 500, message = "Observações deve ter no máximo 500 caracteres")
private String observacoes;
}

text

### Regras de Negócio

1. **Propriedade**: Usuário só pode manipular suas próprias despesas
2. **Categoria Ativa**: Categoria deve existir e estar ativa
3. **Parcelas**: `parcelaAtual` ≤ `parcelaTotal`
4. **Status**: Transições válidas de status
5. **Data**: Não pode ser futura
6. **Valor**: Deve ser positivo

## Índices de Performance

-- Listar despesas do usuário
CREATE INDEX idx_despesas_usuario_data
ON despesas(usuario_id, data DESC);

-- Filtrar por categoria
CREATE INDEX idx_despesas_categoria
ON despesas(categoria_id);

-- Filtrar por status
CREATE INDEX idx_despesas_status
ON despesas(status);

-- Busca por período
CREATE INDEX idx_despesas_usuario_periodo
ON despesas(usuario_id, data)
WHERE status != 'CANCELADO';

text

## Invalidação de Cache

Após criar, atualizar ou deletar despesas, os seguintes caches são invalidados:

- `dashboard:{usuarioId}:*` - Dashboard do usuário
- `despesas:resumo:{usuarioId}:*` - Resumos de despesas
- `despesas:total:{usuarioId}:*` - Totalizadores

@CacheEvict(value = {"dashboard", "despesas-resumo"},
key = "#usuarioId",
allEntries = true)
public void invalidarCacheDespesas(Long usuarioId) {
// Cache invalidado automaticamente
}
