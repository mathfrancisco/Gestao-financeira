package com.financeiro.financeiro_pessoal_backend.controller;

import com.financeiro.financeiro_pessoal_backend.dto.request.DespesaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.DespesaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.ReceitaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.enums.StatusPagamento;
import com.financeiro.financeiro_pessoal_backend.service.DespesaService;
import com.financeiro.financeiro_pessoal_backend.service.ReceitaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/despesas")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Despesas", description = "Gerenciamento de despesas")
public class DespesaController {

    private final DespesaService despesaService;
    private final ReceitaService receitaService;

    @PostMapping
    @Operation(summary = "Criar nova despesa")
    public ResponseEntity<DespesaResponseDTO> create(@Valid @RequestBody DespesaRequestDTO request) {
        log.info("POST /despesas");
        DespesaResponseDTO response = despesaService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar receita por ID")
    public ResponseEntity<ReceitaResponseDTO> findById(
            @PathVariable @Min(value = 1, message = "ID deve ser maior que zero") Long id) {
        log.info("GET /receitas/{}", id);
        ReceitaResponseDTO response = receitaService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Listar despesas com paginação")
    public ResponseEntity<Page<DespesaResponseDTO>> findAll(
            @PageableDefault(size = 20, sort = "data", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /despesas - Página: {}", pageable.getPageNumber());
        Page<DespesaResponseDTO> response = despesaService.findAllByUsuario(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/periodo")
    @Operation(summary = "Buscar despesas por período")
    public ResponseEntity<Page<DespesaResponseDTO>> findByPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @PageableDefault(size = 20, sort = "data", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /despesas/periodo?inicio={}&fim={}", inicio, fim);
        Page<DespesaResponseDTO> response = despesaService.findByPeriodo(inicio, fim, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Buscar despesas por status")
    public ResponseEntity<List<DespesaResponseDTO>> findByStatus(@PathVariable StatusPagamento status) {
        log.info("GET /despesas/status/{}", status);
        List<DespesaResponseDTO> response = despesaService.findByStatus(status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vencidas")
    @Operation(summary = "Buscar despesas vencidas")
    public ResponseEntity<List<DespesaResponseDTO>> findVencidas() {
        log.info("GET /despesas/vencidas");
        List<DespesaResponseDTO> response = despesaService.findVencidas();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/categoria/{categoriaId}")
    @Operation(summary = "Buscar despesas por categoria")
    public ResponseEntity<Page<DespesaResponseDTO>> findByCategoria(
            @PathVariable Long categoriaId,
            @PageableDefault(size = 20, sort = "data", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /despesas/categoria/{}", categoriaId);
        Page<DespesaResponseDTO> response = despesaService.findByCategoria(categoriaId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/receita/{receitaId}")
    @Operation(summary = "Buscar despesas por receita")
    public ResponseEntity<List<DespesaResponseDTO>> findByReceita(@PathVariable Long receitaId) {
        log.info("GET /despesas/receita/{}", receitaId);
        List<DespesaResponseDTO> response = despesaService.findByReceita(receitaId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/parceladas")
    @Operation(summary = "Buscar despesas parceladas")
    public ResponseEntity<List<DespesaResponseDTO>> findParceladas() {
        log.info("GET /despesas/parceladas");
        List<DespesaResponseDTO> response = despesaService.findParceladas();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mes/{ano}/{mes}")
    @Operation(summary = "Buscar despesas do mês")
    public ResponseEntity<List<DespesaResponseDTO>> findByMes(
            @PathVariable int ano,
            @PathVariable int mes) {
        log.info("GET /despesas/mes/{}/{}", ano, mes);
        List<DespesaResponseDTO> response = despesaService.findByMes(ano, mes);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar despesa")
    public ResponseEntity<DespesaResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody DespesaRequestDTO request) {
        log.info("PUT /despesas/{}", id);
        DespesaResponseDTO response = despesaService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/pagar")
    @Operation(summary = "Marcar despesa como paga")
    public ResponseEntity<DespesaResponseDTO> marcarComoPaga(@PathVariable Long id) {
        log.info("PATCH /despesas/{}/pagar", id);
        DespesaResponseDTO response = despesaService.marcarComoPaga(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/pendente")
    @Operation(summary = "Marcar despesa como pendente")
    public ResponseEntity<DespesaResponseDTO> marcarComoPendente(@PathVariable Long id) {
        log.info("PATCH /despesas/{}/pendente", id);
        DespesaResponseDTO response = despesaService.marcarComoPendente(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar despesa")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /despesas/{}", id);
        despesaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/total")
    @Operation(summary = "Calcular total de despesas por período")
    public ResponseEntity<BigDecimal> calcularTotalPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        log.info("GET /despesas/total?inicio={}&fim={}", inicio, fim);
        BigDecimal total = despesaService.calcularTotalPorPeriodo(inicio, fim);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/total/pagas")
    @Operation(summary = "Calcular total de despesas pagas por período")
    public ResponseEntity<BigDecimal> calcularTotalPagoPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        log.info("GET /despesas/total/pagas?inicio={}&fim={}", inicio, fim);
        BigDecimal total = despesaService.calcularTotalPagoPorPeriodo(inicio, fim);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/total/pendentes")
    @Operation(summary = "Calcular total de despesas pendentes por período")
    public ResponseEntity<BigDecimal> calcularTotalPendentePorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        log.info("GET /despesas/total/pendentes?inicio={}&fim={}", inicio, fim);
        BigDecimal total = despesaService.calcularTotalPendentePorPeriodo(inicio, fim);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/agrupar-categoria")
    @Operation(summary = "Agrupar despesas por categoria")
    public ResponseEntity<Map<String, BigDecimal>> agruparPorCategoria(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        log.info("GET /despesas/agrupar-categoria?inicio={}&fim={}", inicio, fim);
        Map<String, BigDecimal> response = despesaService.agruparPorCategoria(inicio, fim);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count/status/{status}")
    @Operation(summary = "Contar despesas por status")
    public ResponseEntity<Long> countByStatus(@PathVariable StatusPagamento status) {
        log.info("GET /despesas/count/status/{}", status);
        Long count = despesaService.countByStatus(status);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/media-mensal")
    @Operation(summary = "Calcular média mensal de despesas")
    public ResponseEntity<BigDecimal> calcularMediaMensal() {
        log.info("GET /despesas/media-mensal");
        BigDecimal media = despesaService.calcularMediaMensal();
        return ResponseEntity.ok(media);
    }

    @GetMapping("/resumo-mensal/{ano}/{mes}")
    @Operation(summary = "Resumo mensal de despesas")
    public ResponseEntity<Map<String, Object>> getResumoMensal(
            @PathVariable int ano,
            @PathVariable int mes) {
        log.info("GET /despesas/resumo-mensal/{}/{}", ano, mes);
        Map<String, Object> resumo = despesaService.getResumoMensal(ano, mes);
        return ResponseEntity.ok(resumo);
    }
}