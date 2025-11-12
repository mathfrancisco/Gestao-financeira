package com.financeiro.financeiro_pessoal_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponseDTO {

    // Período
    private Integer mes;
    private Integer ano;
    private String periodo;

    // Receitas
    private BigDecimal totalReceitas;
    private BigDecimal mediaReceitasMensal;

    // Despesas
    private BigDecimal totalDespesas;
    private BigDecimal totalDespesasPagas;
    private BigDecimal totalDespesasPendentes;
    private BigDecimal mediaDespesasMensal;
    private Long countDespesasPagas;
    private Long countDespesasPendentes;

    // Saldos
    private BigDecimal saldo;
    private BigDecimal saldoDisponivel;

    // Percentuais
    private BigDecimal percentualGasto;
    private BigDecimal percentualEconomizado;
    private BigDecimal taxaPagamento;

    // Despesas por categoria
    private Map<String, BigDecimal> despesasPorCategoria;
    private List<CategoriaResumo> topCategorias;

    // Metas
    private BigDecimal valorObjetivoMetas;
    private BigDecimal valorAtualMetas;
    private BigDecimal valorRestanteMetas;
    private BigDecimal totalEconomizado;
    private BigDecimal progressoMedioMetas;
    private Long countMetasEmAndamento;
    private Long countMetasConcluidas;
    private Long countMetasVencidas;

    // Categorias
    private Long totalCategorias;
    private Long categoriasAtivas;

    // DTO interno para resumo de categoria
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoriaResumo {
        private String nome;
        private BigDecimal valor;
        private BigDecimal percentual;
    }
}