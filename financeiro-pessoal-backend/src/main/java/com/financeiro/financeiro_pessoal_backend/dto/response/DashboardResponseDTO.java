package com.financeiro.financeiro_pessoal_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponseDTO {

    private BigDecimal totalReceitas;
    private BigDecimal totalDespesas;
    private BigDecimal saldo;
    private BigDecimal despesasPagas;
    private BigDecimal despesasPendentes;
    private Integer totalMetas;
    private Integer metasConcluidas;
    private BigDecimal progressoMetas;

    private List<DespesaPorCategoriaDTO> despesasPorCategoria;
    private List<EvolucaoMensalDTO> evolucaoMensal;
    private List<MetaResumoDTO> topMetas;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DespesaPorCategoriaDTO {
        private String categoria;
        private BigDecimal valor;
        private BigDecimal percentual;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvolucaoMensalDTO {
        private String mes;
        private BigDecimal receitas;
        private BigDecimal despesas;
        private BigDecimal saldo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetaResumoDTO {
        private String nome;
        private BigDecimal valorObjetivo;
        private BigDecimal valorAtual;
        private BigDecimal progresso;
    }
}