package com.financeiro.financeiro_pessoal_backend.service;

import com.financeiro.financeiro_pessoal_backend.dto.response.DashboardResponseDTO;
import com.financeiro.financeiro_pessoal_backend.exception.ValidationException;
import com.financeiro.financeiro_pessoal_backend.model.enums.StatusMeta;
import com.financeiro.financeiro_pessoal_backend.model.enums.StatusPagamento;
import com.financeiro.financeiro_pessoal_backend.repository.CategoriaRepository;
import com.financeiro.financeiro_pessoal_backend.repository.DespesaRepository;
import com.financeiro.financeiro_pessoal_backend.repository.MetaRepository;
import com.financeiro.financeiro_pessoal_backend.repository.ReceitaRepository;
import com.financeiro.financeiro_pessoal_backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final ReceitaRepository receitaRepository;
    private final DespesaRepository despesaRepository;
    private final MetaRepository metaRepository;
    private final CategoriaRepository categoriaRepository;
    private final SecurityUtil securityUtil;

    /**
     * Retorna dados consolidados do dashboard
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard", key = "'geral_' + #mes + '_' + #ano + '_' + @securityUtil.usuarioLogadoId")
    public DashboardResponseDTO getDashboard(Integer mes, Integer ano) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.info("Gerando dashboard para usuário {} - Mês: {}, Ano: {}", usuarioId, mes, ano);

        // Se não informado, usa mês/ano atual
        if (mes == null || ano == null) {
            YearMonth agora = YearMonth.now();
            mes = agora.getMonthValue();
            ano = agora.getYear();
        }

        validateMesAno(mes, ano);

        YearMonth periodo = YearMonth.of(ano, mes);
        LocalDate inicio = periodo.atDay(1);
        LocalDate fim = periodo.atEndOfMonth();

        // Calcula totais do período
        BigDecimal totalReceitas = receitaRepository.sumTotalReceitasByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
        BigDecimal totalDespesas = despesaRepository.sumTotalByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
        BigDecimal totalDespesasPagas = despesaRepository.sumTotalPagoByPeriodo(usuarioId, inicio, fim);
        BigDecimal totalDespesasPendentes = despesaRepository.sumTotalPendenteByPeriodo(usuarioId, inicio, fim);

        BigDecimal saldo = totalReceitas.subtract(totalDespesas);
        BigDecimal saldoDisponivel = totalReceitas.subtract(totalDespesasPagas);

        // Estatísticas de despesas
        Long countDespesasPagas = despesaRepository.countByUsuarioIdAndStatus(usuarioId, StatusPagamento.PAGO);
        Long countDespesasPendentes = despesaRepository.countByUsuarioIdAndStatus(usuarioId, StatusPagamento.PENDENTE);
        List<Object[]> despesasPorCategoria = despesaRepository.sumByCategoria(usuarioId, inicio, fim);

        // Estatísticas de metas
        BigDecimal valorObjetivoMetas = metaRepository.sumValorObjetivoEmAndamento(usuarioId);
        BigDecimal valorAtualMetas = metaRepository.sumValorAtualEmAndamento(usuarioId);
        BigDecimal totalEconomizado = metaRepository.sumTotalEconomizado(usuarioId);
        BigDecimal progressoMedioMetas = metaRepository.calcularProgressoMedio(usuarioId);

        Long countMetasEmAndamento = metaRepository.countByUsuarioIdAndStatus(usuarioId, StatusMeta.EM_ANDAMENTO);
        Long countMetasConcluidas = metaRepository.countByUsuarioIdAndStatus(usuarioId, StatusMeta.CONCLUIDA);
        Long countMetasVencidas = metaRepository.countVencidasByUsuarioId(usuarioId);

        // Estatísticas de categorias
        Long totalCategorias = categoriaRepository.countByUsuarioId(usuarioId);
        Long categoriasAtivas = categoriaRepository.countAtivasByUsuarioId(usuarioId);

        // Médias
        BigDecimal mediaDespesasMensal = despesaRepository.calcularMediaMensalByUsuarioId(usuarioId);
        BigDecimal mediaReceitasMensal = receitaRepository.calcularMediaReceitasByUsuarioId(usuarioId);

        // Percentuais
        BigDecimal percentualGasto = calcularPercentual(totalDespesas, totalReceitas);
        BigDecimal percentualEconomizado = calcularPercentual(saldo, totalReceitas);
        BigDecimal taxaPagamento = calcularPercentual(totalDespesasPagas, totalDespesas);

        // Monta mapa de despesas por categoria
        Map<String, BigDecimal> despesasCategoria = new LinkedHashMap<>();
        for (Object[] result : despesasPorCategoria) {
            String categoria = (String) result[0];
            BigDecimal valor = (BigDecimal) result[1];
            despesasCategoria.put(categoria != null ? categoria : "Sem categoria", valor);
        }

        // Top 5 categorias
        List<DashboardResponseDTO.CategoriaResumo> topCategorias = despesasCategoria.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .limit(5)
                .map(entry -> DashboardResponseDTO.CategoriaResumo.builder()
                        .nome(entry.getKey())
                        .valor(entry.getValue())
                        .percentual(calcularPercentual(entry.getValue(), totalDespesas))
                        .build())
                .collect(Collectors.toList());

        log.info("Dashboard gerado - Receitas: {}, Despesas: {}, Saldo: {}",
                totalReceitas, totalDespesas, saldo);

        return DashboardResponseDTO.builder()
                .mes(mes)
                .ano(ano)
                .periodo(String.format("%02d/%d", mes, ano))
                // Receitas
                .totalReceitas(totalReceitas)
                .mediaReceitasMensal(mediaReceitasMensal != null ? mediaReceitasMensal : BigDecimal.ZERO)
                // Despesas
                .totalDespesas(totalDespesas)
                .totalDespesasPagas(totalDespesasPagas)
                .totalDespesasPendentes(totalDespesasPendentes)
                .mediaDespesasMensal(mediaDespesasMensal != null ? mediaDespesasMensal : BigDecimal.ZERO)
                .countDespesasPagas(countDespesasPagas)
                .countDespesasPendentes(countDespesasPendentes)
                // Saldos
                .saldo(saldo)
                .saldoDisponivel(saldoDisponivel)
                // Percentuais
                .percentualGasto(percentualGasto)
                .percentualEconomizado(percentualEconomizado)
                .taxaPagamento(taxaPagamento)
                // Despesas por categoria
                .despesasPorCategoria(despesasCategoria)
                .topCategorias(topCategorias)
                // Metas
                .valorObjetivoMetas(valorObjetivoMetas)
                .valorAtualMetas(valorAtualMetas)
                .valorRestanteMetas(valorObjetivoMetas.subtract(valorAtualMetas))
                .totalEconomizado(totalEconomizado)
                .progressoMedioMetas(progressoMedioMetas != null ? progressoMedioMetas : BigDecimal.ZERO)
                .countMetasEmAndamento(countMetasEmAndamento)
                .countMetasConcluidas(countMetasConcluidas)
                .countMetasVencidas(countMetasVencidas)
                // Categorias
                .totalCategorias(totalCategorias)
                .categoriasAtivas(categoriasAtivas)
                .build();
    }

    /**
     * Retorna total de receitas do período
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard", key = "'receitas_' + #inicio + '_' + #fim + '_' + @securityUtil.usuarioLogadoId")
    public BigDecimal getTotalReceitas(LocalDate inicio, LocalDate fim) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Calculando total de receitas - Período: {} a {}", inicio, fim);

        validatePeriodo(inicio, fim);

        BigDecimal total = receitaRepository.sumTotalReceitasByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
        log.info("Total de receitas no período: {}", total);
        return total;
    }

    /**
     * Retorna total de despesas do período
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard", key = "'despesas_' + #inicio + '_' + #fim + '_' + @securityUtil.usuarioLogadoId")
    public BigDecimal getTotalDespesas(LocalDate inicio, LocalDate fim) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Calculando total de despesas - Período: {} a {}", inicio, fim);

        validatePeriodo(inicio, fim);

        BigDecimal total = despesaRepository.sumTotalByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
        log.info("Total de despesas no período: {}", total);
        return total;
    }

    /**
     * Retorna saldo atual
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard", key = "'saldo_' +  @securityUtil.usuarioLogadoId", unless = "#result == null")
    public Map<String, BigDecimal> getSaldo() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Calculando saldo do usuário: {}", usuarioId);

        // Usa mês atual
        YearMonth mesAtual = YearMonth.now();
        LocalDate inicio = mesAtual.atDay(1);
        LocalDate fim = mesAtual.atEndOfMonth();

        BigDecimal totalReceitas = receitaRepository.sumTotalReceitasByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
        BigDecimal totalDespesas = despesaRepository.sumTotalByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
        BigDecimal totalPago = despesaRepository.sumTotalPagoByPeriodo(usuarioId, inicio, fim);

        BigDecimal saldo = totalReceitas.subtract(totalDespesas);
        BigDecimal saldoDisponivel = totalReceitas.subtract(totalPago);

        Map<String, BigDecimal> resultado = new HashMap<>();
        resultado.put("totalReceitas", totalReceitas);
        resultado.put("totalDespesas", totalDespesas);
        resultado.put("totalPago", totalPago);
        resultado.put("saldo", saldo);
        resultado.put("saldoDisponivel", saldoDisponivel);

        log.info("Saldo calculado - Total: {}, Disponível: {}", saldo, saldoDisponivel);
        return resultado;
    }

    /**
     * Compara dois períodos
     */
    @Transactional(readOnly = true)
    public Map<String, Object> compararPeriodos(Integer mes1, Integer ano1, Integer mes2, Integer ano2) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Comparando períodos: {}/{} vs {}/{}", mes1, ano1, mes2, ano2);

        validateMesAno(mes1, ano1);
        validateMesAno(mes2, ano2);

        YearMonth periodo1 = YearMonth.of(ano1, mes1);
        YearMonth periodo2 = YearMonth.of(ano2, mes2);

        LocalDate inicio1 = periodo1.atDay(1);
        LocalDate fim1 = periodo1.atEndOfMonth();
        LocalDate inicio2 = periodo2.atDay(1);
        LocalDate fim2 = periodo2.atEndOfMonth();

        // Calcula totais de cada período
        BigDecimal receitas1 = receitaRepository.sumTotalReceitasByUsuarioIdAndPeriodo(usuarioId, inicio1, fim1);
        BigDecimal despesas1 = despesaRepository.sumTotalByUsuarioIdAndPeriodo(usuarioId, inicio1, fim1);
        BigDecimal saldo1 = receitas1.subtract(despesas1);

        BigDecimal receitas2 = receitaRepository.sumTotalReceitasByUsuarioIdAndPeriodo(usuarioId, inicio2, fim2);
        BigDecimal despesas2 = despesaRepository.sumTotalByUsuarioIdAndPeriodo(usuarioId, inicio2, fim2);
        BigDecimal saldo2 = receitas2.subtract(despesas2);

        // Calcula variações
        BigDecimal variacaoReceitas = receitas2.subtract(receitas1);
        BigDecimal variacaoDespesas = despesas2.subtract(despesas1);
        BigDecimal variacaoSaldo = saldo2.subtract(saldo1);

        BigDecimal variacaoPercentualReceitas = calcularVariacaoPercentual(receitas1, receitas2);
        BigDecimal variacaoPercentualDespesas = calcularVariacaoPercentual(despesas1, despesas2);
        BigDecimal variacaoPercentualSaldo = calcularVariacaoPercentual(saldo1, saldo2);

        Map<String, Object> comparacao = new HashMap<>();

        // Período 1
        Map<String, Object> dadosPeriodo1 = new HashMap<>();
        dadosPeriodo1.put("periodo", String.format("%02d/%d", mes1, ano1));
        dadosPeriodo1.put("receitas", receitas1);
        dadosPeriodo1.put("despesas", despesas1);
        dadosPeriodo1.put("saldo", saldo1);

        // Período 2
        Map<String, Object> dadosPeriodo2 = new HashMap<>();
        dadosPeriodo2.put("periodo", String.format("%02d/%d", mes2, ano2));
        dadosPeriodo2.put("receitas", receitas2);
        dadosPeriodo2.put("despesas", despesas2);
        dadosPeriodo2.put("saldo", saldo2);

        // Variações
        Map<String, Object> variacoes = new HashMap<>();
        variacoes.put("receitas", variacaoReceitas);
        variacoes.put("despesas", variacaoDespesas);
        variacoes.put("saldo", variacaoSaldo);
        variacoes.put("percentualReceitas", variacaoPercentualReceitas);
        variacoes.put("percentualDespesas", variacaoPercentualDespesas);
        variacoes.put("percentualSaldo", variacaoPercentualSaldo);

        comparacao.put("periodo1", dadosPeriodo1);
        comparacao.put("periodo2", dadosPeriodo2);
        comparacao.put("variacoes", variacoes);

        log.info("Comparação gerada - Variação saldo: {} ({}%)",
                variacaoSaldo, variacaoPercentualSaldo);

        return comparacao;
    }

    /**
     * Evolução dos últimos N meses
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard", key = "'evolucao_' + #meses + '_' +  @securityUtil.usuarioLogadoId")
    public List<Map<String, Object>> getEvolucao(int meses) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Gerando evolução dos últimos {} meses", meses);

        if (meses < 1 || meses > 24) {
            throw new ValidationException("Número de meses deve estar entre 1 e 24");
        }

        List<Map<String, Object>> evolucao = new ArrayList<>();
        YearMonth mesAtual = YearMonth.now();

        for (int i = meses - 1; i >= 0; i--) {
            YearMonth periodo = mesAtual.minusMonths(i);
            LocalDate inicio = periodo.atDay(1);
            LocalDate fim = periodo.atEndOfMonth();

            BigDecimal receitas = receitaRepository.sumTotalReceitasByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
            BigDecimal despesas = despesaRepository.sumTotalByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
            BigDecimal saldo = receitas.subtract(despesas);

            Map<String, Object> dadosMes = new HashMap<>();
            dadosMes.put("mes", periodo.getMonthValue());
            dadosMes.put("ano", periodo.getYear());
            dadosMes.put("periodo", String.format("%02d/%d", periodo.getMonthValue(), periodo.getYear()));
            dadosMes.put("receitas", receitas);
            dadosMes.put("despesas", despesas);
            dadosMes.put("saldo", saldo);

            evolucao.add(dadosMes);
        }

        log.info("Evolução gerada para {} meses", meses);
        return evolucao;
    }

    /**
     * Top N categorias mais gastas
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard", key = "'top_categorias_' + #limite + '_' + #mes + '_' + #ano + '_' +  @securityUtil.usuarioLogadoId")
    public List<Map<String, Object>> getTopCategorias(int limite, Integer mes, Integer ano) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando top {} categorias", limite);

        if (limite < 1 || limite > 20) {
            throw new ValidationException("Limite deve estar entre 1 e 20");
        }

        // Se não informado, usa mês/ano atual
        if (mes == null || ano == null) {
            YearMonth agora = YearMonth.now();
            mes = agora.getMonthValue();
            ano = agora.getYear();
        }

        validateMesAno(mes, ano);

        YearMonth periodo = YearMonth.of(ano, mes);
        LocalDate inicio = periodo.atDay(1);
        LocalDate fim = periodo.atEndOfMonth();

        List<Object[]> results = despesaRepository.sumByCategoria(usuarioId, inicio, fim);
        BigDecimal totalDespesas = despesaRepository.sumTotalByUsuarioIdAndPeriodo(usuarioId, inicio, fim);

        List<Map<String, Object>> topCategorias = results.stream()
                .limit(limite)
                .map(result -> {
                    String categoria = (String) result[0];
                    BigDecimal valor = (BigDecimal) result[1];

                    Map<String, Object> item = new HashMap<>();
                    item.put("categoria", categoria != null ? categoria : "Sem categoria");
                    item.put("valor", valor);
                    item.put("percentual", calcularPercentual(valor, totalDespesas));

                    return item;
                })
                .collect(Collectors.toList());

        log.info("Top {} categorias gerado", topCategorias.size());
        return topCategorias;
    }

    /**
     * Indicadores financeiros
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getIndicadores() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Gerando indicadores financeiros");

        YearMonth mesAtual = YearMonth.now();
        LocalDate inicio = mesAtual.atDay(1);
        LocalDate fim = mesAtual.atEndOfMonth();

        BigDecimal totalReceitas = receitaRepository.sumTotalReceitasByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
        BigDecimal totalDespesas = despesaRepository.sumTotalByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
        BigDecimal totalPago = despesaRepository.sumTotalPagoByPeriodo(usuarioId, inicio, fim);
        BigDecimal totalPendente = despesaRepository.sumTotalPendenteByPeriodo(usuarioId, inicio, fim);

        Long despesasVencidas = despesaRepository.countByUsuarioIdAndStatus(usuarioId, StatusPagamento.PENDENTE);
        Long metasVencidas = metaRepository.countVencidasByUsuarioId(usuarioId);

        BigDecimal saldo = totalReceitas.subtract(totalDespesas);
        BigDecimal taxaEconomia = calcularPercentual(saldo, totalReceitas);
        BigDecimal taxaEndividamento = calcularPercentual(totalDespesas, totalReceitas);
        BigDecimal capacidadePagamento = calcularPercentual(totalPago, totalDespesas);

        // Saúde financeira (0-100)
        int saudeFinanceira = calcularSaudeFinanceira(
                taxaEconomia, taxaEndividamento, capacidadePagamento,
                despesasVencidas, metasVencidas);

        Map<String, Object> indicadores = new HashMap<>();
        indicadores.put("saldo", saldo);
        indicadores.put("taxaEconomia", taxaEconomia);
        indicadores.put("taxaEndividamento", taxaEndividamento);
        indicadores.put("capacidadePagamento", capacidadePagamento);
        indicadores.put("totalPendente", totalPendente);
        indicadores.put("despesasVencidas", despesasVencidas);
        indicadores.put("metasVencidas", metasVencidas);
        indicadores.put("saudeFinanceira", saudeFinanceira);
        indicadores.put("classificacao", classificarSaudeFinanceira(saudeFinanceira));

        log.info("Indicadores gerados - Saúde financeira: {}", saudeFinanceira);
        return indicadores;
    }

    /**
     * Calcula percentual
     */
    private BigDecimal calcularPercentual(BigDecimal valor, BigDecimal total) {
        if (total == null || total.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return valor.multiply(BigDecimal.valueOf(100))
                .divide(total, 2, RoundingMode.HALF_UP);
    }

    /**
     * Calcula variação percentual entre dois valores
     */
    private BigDecimal calcularVariacaoPercentual(BigDecimal valorAnterior, BigDecimal valorAtual) {
        if (valorAnterior == null || valorAnterior.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal variacao = valorAtual.subtract(valorAnterior);
        return variacao.multiply(BigDecimal.valueOf(100))
                .divide(valorAnterior, 2, RoundingMode.HALF_UP);
    }

    /**
     * Calcula saúde financeira (0-100)
     */
    private int calcularSaudeFinanceira(BigDecimal taxaEconomia, BigDecimal taxaEndividamento,
                                        BigDecimal capacidadePagamento, Long despesasVencidas, Long metasVencidas) {
        int pontuacao = 100;

        // Penaliza alta taxa de endividamento
        if (taxaEndividamento.compareTo(BigDecimal.valueOf(80)) > 0) {
            pontuacao -= 30;
        } else if (taxaEndividamento.compareTo(BigDecimal.valueOf(60)) > 0) {
            pontuacao -= 20;
        } else if (taxaEndividamento.compareTo(BigDecimal.valueOf(40)) > 0) {
            pontuacao -= 10;
        }

        // Bonifica boa taxa de economia
        if (taxaEconomia.compareTo(BigDecimal.valueOf(30)) > 0) {
            pontuacao += 10;
        } else if (taxaEconomia.compareTo(BigDecimal.valueOf(20)) > 0) {
            pontuacao += 5;
        }

        // Penaliza baixa capacidade de pagamento
        if (capacidadePagamento.compareTo(BigDecimal.valueOf(50)) < 0) {
            pontuacao -= 20;
        } else if (capacidadePagamento.compareTo(BigDecimal.valueOf(70)) < 0) {
            pontuacao -= 10;
        }

        // Penaliza despesas vencidas
        if (despesasVencidas > 5) {
            pontuacao -= 15;
        } else if (despesasVencidas > 0) {
            pontuacao -= 5;
        }

        // Penaliza metas vencidas
        if (metasVencidas > 3) {
            pontuacao -= 10;
        } else if (metasVencidas > 0) {
            pontuacao -= 5;
        }

        return Math.max(0, Math.min(100, pontuacao));
    }

    /**
     * Classifica saúde financeira
     */
    private String classificarSaudeFinanceira(int pontuacao) {
        if (pontuacao >= 80) return "Excelente";
        if (pontuacao >= 60) return "Boa";
        if (pontuacao >= 40) return "Regular";
        if (pontuacao >= 20) return "Ruim";
        return "Crítica";
    }

    /**
     * Valida mês e ano
     */
    private void validateMesAno(int mes, int ano) {
        if (mes < 1 || mes > 12) {
            throw new ValidationException("Mês inválido");
        }
        if (ano < 1990 || ano > 2100) {
            throw new ValidationException("Ano inválido");
        }
    }

    /**
     * Valida período
     */
    private void validatePeriodo(LocalDate inicio, LocalDate fim) {
        if (inicio == null || fim == null) {
            throw new ValidationException("Período inicial e final são obrigatórios");
        }
        if (inicio.isAfter(fim)) {
            throw new ValidationException("Data inicial não pode ser posterior à data final");
        }
    }
}