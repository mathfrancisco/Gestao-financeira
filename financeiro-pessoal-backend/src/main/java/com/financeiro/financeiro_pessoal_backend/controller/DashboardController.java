package com.financeiro.financeiro_pessoal_backend.controller;

import com.financeiro.financeiro_pessoal_backend.dto.response.DashboardResponseDTO;
import com.financeiro.financeiro_pessoal_backend.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dashboard", description = "Dashboard e análises financeiras consolidadas")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Dashboard geral")
    public ResponseEntity<DashboardResponseDTO> getDashboard(
            @RequestParam(required = false) Optional<Integer> mes,
            @RequestParam(required = false) Optional<Integer> ano) {
        log.info("GET /dashboard?mes={}&ano={}", mes.orElse(null), ano.orElse(null));
        DashboardResponseDTO response = dashboardService.getDashboard(
                mes.orElseGet(() -> LocalDate.now().getMonthValue()),
                ano.orElseGet(() -> LocalDate.now().getYear())
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/receitas-totais")
    @Operation(summary = "Total de receitas do período")
    public ResponseEntity<BigDecimal> getTotalReceitas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        log.info("GET /dashboard/receitas-totais?inicio={}&fim={}", inicio, fim);
        BigDecimal total = dashboardService.getTotalReceitas(inicio, fim);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/despesas-totais")
    @Operation(summary = "Total de despesas do período")
    public ResponseEntity<BigDecimal> getTotalDespesas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        log.info("GET /dashboard/despesas-totais?inicio={}&fim={}", inicio, fim);
        BigDecimal total = dashboardService.getTotalDespesas(inicio, fim);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/saldo")
    @Operation(summary = "Saldo atual", description = "Saldo do mês corrente")
    public ResponseEntity<Map<String, BigDecimal>> getSaldo() {
        log.info("GET /dashboard/saldo");
        Map<String, BigDecimal> saldo = dashboardService.getSaldo();
        return ResponseEntity.ok(saldo);
    }

    @GetMapping("/comparativo")
    @Operation(summary = "Comparar dois períodos", description = "Compara receitas, despesas e saldo entre dois meses")
    public ResponseEntity<Map<String, Object>> compararPeriodos(
            @RequestParam Integer mes1,
            @RequestParam Integer ano1,
            @RequestParam Integer mes2,
            @RequestParam Integer ano2) {
        log.info("GET /dashboard/comparativo?mes1={}&ano1={}&mes2={}&ano2={}", mes1, ano1, mes2, ano2);
        Map<String, Object> comparacao = dashboardService.compararPeriodos(mes1, ano1, mes2, ano2);
        return ResponseEntity.ok(comparacao);
    }

    @GetMapping("/evolucao")
    @Operation(summary = "Evolução dos últimos N meses", description = "Histórico de receitas, despesas e saldo")
    public ResponseEntity<List<Map<String, Object>>> getEvolucao(
            @RequestParam(defaultValue = "6") int meses) {
        log.info("GET /dashboard/evolucao?meses={}", meses);
        List<Map<String, Object>> evolucao = dashboardService.getEvolucao(meses);
        return ResponseEntity.ok(evolucao);
    }

    @GetMapping("/categorias-top")
    @Operation(summary = "Top N categorias mais gastas", description = "Ranking das categorias com maiores gastos")
    public ResponseEntity<List<Map<String, Object>>> getTopCategorias(
            @RequestParam(defaultValue = "5") int limite,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer ano) {
        log.info("GET /dashboard/categorias-top?limite={}&mes={}&ano={}", limite, mes, ano);
        List<Map<String, Object>> topCategorias = dashboardService.getTopCategorias(limite, mes, ano);
        return ResponseEntity.ok(topCategorias);
    }

    @GetMapping("/indicadores")
    @Operation(summary = "Indicadores financeiros", description = "Indicadores de saúde financeira e capacidade de pagamento")
    public ResponseEntity<Map<String, Object>> getIndicadores() {
        log.info("GET /dashboard/indicadores");
        Map<String, Object> indicadores = dashboardService.getIndicadores();
        return ResponseEntity.ok(indicadores);
    }
}