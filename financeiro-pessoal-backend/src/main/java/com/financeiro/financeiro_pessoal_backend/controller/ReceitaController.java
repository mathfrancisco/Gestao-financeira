package com.financeiro.financeiro_pessoal_backend.controller;

import com.financeiro.financeiro_pessoal_backend.dto.request.ReceitaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.ReceitaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.service.ReceitaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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

@RestController
@RequestMapping("/receitas")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Receitas", description = "Gerenciamento de receitas")
public class ReceitaController {

    private final ReceitaService receitaService;

    @PostMapping
    @Operation(summary = "Criar nova receita")
    public ResponseEntity<ReceitaResponseDTO> create(@Valid @RequestBody ReceitaRequestDTO request) {
        log.info("POST /receitas");
        ReceitaResponseDTO response = receitaService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar receita por ID")
    public ResponseEntity<ReceitaResponseDTO> findById(@PathVariable Long id) {
        log.info("GET /receitas/{}", id);
        ReceitaResponseDTO response = receitaService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/despesas")
    @Operation(summary = "Buscar receita por ID com despesas")
    public ResponseEntity<ReceitaResponseDTO> findByIdWithDespesas(@PathVariable Long id) {
        log.info("GET /receitas/{}/despesas", id);
        ReceitaResponseDTO response = receitaService.findByIdWithDespesas(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Listar receitas com paginação")
    public ResponseEntity<Page<ReceitaResponseDTO>> findAll(
            @PageableDefault(size = 20, sort = "periodoInicio", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /receitas - Página: {}", pageable.getPageNumber());
        Page<ReceitaResponseDTO> response = receitaService.findAllByUsuario(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/periodo")
    @Operation(summary = "Buscar receitas por período")
    public ResponseEntity<List<ReceitaResponseDTO>> findByPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        log.info("GET /receitas/periodo?inicio={}&fim={}", inicio, fim);
        List<ReceitaResponseDTO> response = receitaService.findByPeriodo(inicio, fim);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/data/{data}")
    @Operation(summary = "Buscar receitas que contêm uma data específica")
    public ResponseEntity<List<ReceitaResponseDTO>> findByDataInPeriodo(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        log.info("GET /receitas/data/{}", data);
        List<ReceitaResponseDTO> response = receitaService.findByDataInPeriodo(data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mais-recente")
    @Operation(summary = "Buscar receita mais recente")
    public ResponseEntity<ReceitaResponseDTO> findMaisRecente() {
        log.info("GET /receitas/mais-recente");
        ReceitaResponseDTO response = receitaService.findMaisRecente();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ano/{ano}")
    @Operation(summary = "Buscar receitas do ano")
    public ResponseEntity<List<ReceitaResponseDTO>> findByAno(@PathVariable int ano) {
        log.info("GET /receitas/ano/{}", ano);
        List<ReceitaResponseDTO> response = receitaService.findByAno(ano);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar receita")
    public ResponseEntity<ReceitaResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody ReceitaRequestDTO request) {
        log.info("PUT /receitas/{}", id);
        ReceitaResponseDTO response = receitaService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar receita")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /receitas/{}", id);
        receitaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/total")
    @Operation(summary = "Calcular total de receitas por período")
    public ResponseEntity<BigDecimal> calcularTotalPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        log.info("GET /receitas/total?inicio={}&fim={}", inicio, fim);
        BigDecimal total = receitaService.calcularTotalPorPeriodo(inicio, fim);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/media-mensal")
    @Operation(summary = "Calcular média mensal de receitas")
    public ResponseEntity<BigDecimal> calcularMediaMensal() {
        log.info("GET /receitas/media-mensal");
        BigDecimal media = receitaService.calcularMediaMensal();
        return ResponseEntity.ok(media);
    }

    @GetMapping("/count")
    @Operation(summary = "Contar total de receitas")
    public ResponseEntity<Long> count() {
        log.info("GET /receitas/count");
        Long count = receitaService.count();
        return ResponseEntity.ok(count);
    }
}