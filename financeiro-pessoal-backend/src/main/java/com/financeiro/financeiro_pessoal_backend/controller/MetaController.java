package com.financeiro.financeiro_pessoal_backend.controller;

import com.financeiro.financeiro_pessoal_backend.dto.request.AporteMetaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.request.MetaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.MetaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.TransacaoMetaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.enums.StatusMeta;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoMeta;
import com.financeiro.financeiro_pessoal_backend.service.MetaService;
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

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/metas")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Metas", description = "Gerenciamento de metas financeiras")
public class MetaController {

    private final MetaService metaService;

    @PostMapping
    @Operation(summary = "Criar nova meta")
    public ResponseEntity<MetaResponseDTO> create(@Valid @RequestBody MetaRequestDTO request) {
        log.info("POST /metas");
        MetaResponseDTO response = metaService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar meta por ID")
    public ResponseEntity<MetaResponseDTO> findById(@PathVariable Long id) {
        log.info("GET /metas/{}", id);
        MetaResponseDTO response = metaService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/transacoes")
    @Operation(summary = "Buscar meta por ID com transações")
    public ResponseEntity<MetaResponseDTO> findByIdWithTransacoes(@PathVariable Long id) {
        log.info("GET /metas/{}/transacoes", id);
        MetaResponseDTO response = metaService.findByIdWithTransacoes(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Listar metas com paginação")
    public ResponseEntity<Page<MetaResponseDTO>> findAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /metas - Página: {}", pageable.getPageNumber());
        Page<MetaResponseDTO> response = metaService.findAllByUsuario(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Buscar metas por status")
    public ResponseEntity<Page<MetaResponseDTO>> findByStatus(
            @PathVariable StatusMeta status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /metas/status/{}", status);
        Page<MetaResponseDTO> response = metaService.findByStatus(status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/em-andamento")
    @Operation(summary = "Buscar metas em andamento")
    public ResponseEntity<List<MetaResponseDTO>> findEmAndamento() {
        log.info("GET /metas/em-andamento");
        List<MetaResponseDTO> response = metaService.findEmAndamento();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/concluidas")
    @Operation(summary = "Buscar metas concluídas")
    public ResponseEntity<List<MetaResponseDTO>> findConcluidas() {
        log.info("GET /metas/concluidas");
        List<MetaResponseDTO> response = metaService.findConcluidas();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tipo/{tipo}")
    @Operation(summary = "Buscar metas por tipo")
    public ResponseEntity<List<MetaResponseDTO>> findByTipo(@PathVariable TipoMeta tipo) {
        log.info("GET /metas/tipo/{}", tipo);
        List<MetaResponseDTO> response = metaService.findByTipo(tipo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vencidas")
    @Operation(summary = "Buscar metas vencidas")
    public ResponseEntity<List<MetaResponseDTO>> findVencidas() {
        log.info("GET /metas/vencidas");
        List<MetaResponseDTO> response = metaService.findVencidas();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/proximas-vencimento")
    @Operation(summary = "Buscar metas próximas do vencimento (30 dias)")
    public ResponseEntity<List<MetaResponseDTO>> findProximasVencimento() {
        log.info("GET /metas/proximas-vencimento");
        List<MetaResponseDTO> response = metaService.findProximasVencimento();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/prazo")
    @Operation(summary = "Buscar metas por período de prazo")
    public ResponseEntity<List<MetaResponseDTO>> findByPrazoBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        log.info("GET /metas/prazo?inicio={}&fim={}", inicio, fim);
        List<MetaResponseDTO> response = metaService.findByPrazoBetween(inicio, fim);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar meta")
    public ResponseEntity<MetaResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody MetaRequestDTO request) {
        log.info("PUT /metas/{}", id);
        MetaResponseDTO response = metaService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/aportes")
    @Operation(summary = "Adicionar aporte à meta")
    public ResponseEntity<MetaResponseDTO> adicionarAporte(
            @PathVariable Long id,
            @Valid @RequestBody AporteMetaRequestDTO request) {
        log.info("POST /metas/{}/aportes", id);
        MetaResponseDTO response = metaService.adicionarAporte(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/resgates")
    @Operation(summary = "Adicionar resgate à meta")
    public ResponseEntity<MetaResponseDTO> adicionarResgate(
            @PathVariable Long id,
            @Valid @RequestBody AporteMetaRequestDTO request) {
        log.info("POST /metas/{}/resgates", id);
        MetaResponseDTO response = metaService.adicionarResgate(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar meta")
    public ResponseEntity<MetaResponseDTO> cancelar(@PathVariable Long id) {
        log.info("PATCH /metas/{}/cancelar", id);
        MetaResponseDTO response = metaService.cancelar(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/pausar")
    @Operation(summary = "Pausar meta")
    public ResponseEntity<MetaResponseDTO> pausar(@PathVariable Long id) {
        log.info("PATCH /metas/{}/pausar", id);
        MetaResponseDTO response = metaService.pausar(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/retomar")
    @Operation(summary = "Retomar meta pausada")
    public ResponseEntity<MetaResponseDTO> retomar(@PathVariable Long id) {
        log.info("PATCH /metas/{}/retomar", id);
        MetaResponseDTO response = metaService.retomar(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar meta")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /metas/{}", id);
        metaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/transacoes/lista")
    @Operation(summary = "Listar transações de uma meta")
    public ResponseEntity<Page<TransacaoMetaResponseDTO>> findTransacoes(
            @PathVariable Long id,
            @PageableDefault(size = 20, sort = "data", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /metas/{}/transacoes/lista", id);
        Page<TransacaoMetaResponseDTO> response = metaService.findTransacoesByMeta(id, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/resumo")
    @Operation(summary = "Resumo de metas")
    public ResponseEntity<Map<String, Object>> getResumo() {
        log.info("GET /metas/resumo");
        Map<String, Object> resumo = metaService.getResumo();
        return ResponseEntity.ok(resumo);
    }
}