package com.financeiro.financeiro_pessoal_backend.controller;

import com.financeiro.financeiro_pessoal_backend.dto.request.CategoriaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.CategoriaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoCategoria;
import com.financeiro.financeiro_pessoal_backend.service.CategoriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/categorias")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Categorias", description = "Gerenciamento de categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    @PostMapping
    @Operation(summary = "Criar nova categoria")
    public ResponseEntity<CategoriaResponseDTO> create(@Valid @RequestBody CategoriaRequestDTO request) {
        log.info("POST /categorias");
        CategoriaResponseDTO response = categoriaService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar categoria por ID")
    public ResponseEntity<CategoriaResponseDTO> findById(@PathVariable Long id) {
        log.info("GET /categorias/{}", id);
        CategoriaResponseDTO response = categoriaService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/despesas")
    @Operation(summary = "Buscar categoria por ID com despesas")
    public ResponseEntity<CategoriaResponseDTO> findByIdWithDespesas(@PathVariable Long id) {
        log.info("GET /categorias/{}/despesas", id);
        CategoriaResponseDTO response = categoriaService.findByIdWithDespesas(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Listar todas as categorias")
    public ResponseEntity<List<CategoriaResponseDTO>> findAll() {
        log.info("GET /categorias");
        List<CategoriaResponseDTO> response = categoriaService.findAllByUsuario();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ativas")
    @Operation(summary = "Listar categorias ativas")
    public ResponseEntity<List<CategoriaResponseDTO>> findAtivas() {
        log.info("GET /categorias/ativas");
        List<CategoriaResponseDTO> response = categoriaService.findAtivas();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tipo/{tipo}")
    @Operation(summary = "Buscar categorias por tipo")
    public ResponseEntity<List<CategoriaResponseDTO>> findByTipo(@PathVariable TipoCategoria tipo) {
        log.info("GET /categorias/tipo/{}", tipo);
        List<CategoriaResponseDTO> response = categoriaService.findByTipo(tipo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tipo/{tipo}/ativas")
    @Operation(summary = "Buscar categorias ativas por tipo")
    public ResponseEntity<List<CategoriaResponseDTO>> findAtivasByTipo(@PathVariable TipoCategoria tipo) {
        log.info("GET /categorias/tipo/{}/ativas", tipo);
        List<CategoriaResponseDTO> response = categoriaService.findAtivasByTipo(tipo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/despesa/ativas")
    @Operation(summary = "Buscar categorias de despesa ativas")
    public ResponseEntity<List<CategoriaResponseDTO>> findCategoriasDespesaAtivas() {
        log.info("GET /categorias/despesa/ativas");
        List<CategoriaResponseDTO> response = categoriaService.findCategoriasDespesaAtivas();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/receita/ativas")
    @Operation(summary = "Buscar categorias de receita ativas")
    public ResponseEntity<List<CategoriaResponseDTO>> findCategoriasReceitaAtivas() {
        log.info("GET /categorias/receita/ativas");
        List<CategoriaResponseDTO> response = categoriaService.findCategoriasReceitaAtivas();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/com-despesas")
    @Operation(summary = "Buscar categorias com despesas associadas")
    public ResponseEntity<List<CategoriaResponseDTO>> findCategoriasComDespesas() {
        log.info("GET /categorias/com-despesas");
        List<CategoriaResponseDTO> response = categoriaService.findCategoriasComDespesas();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sem-despesas")
    @Operation(summary = "Buscar categorias sem despesas associadas")
    public ResponseEntity<List<CategoriaResponseDTO>> findCategoriasSemDespesas() {
        log.info("GET /categorias/sem-despesas");
        List<CategoriaResponseDTO> response = categoriaService.findCategoriasSemDespesas();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mais-usadas")
    @Operation(summary = "Buscar categorias mais usadas")
    public ResponseEntity<List<CategoriaResponseDTO>> findMaisUsadas() {
        log.info("GET /categorias/mais-usadas");
        List<CategoriaResponseDTO> response = categoriaService.findMaisUsadas();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @Operation(summary = "Buscar categorias por nome")
    public ResponseEntity<List<CategoriaResponseDTO>> searchByNome(@RequestParam String nome) {
        log.info("GET /categorias/search?nome={}", nome);
        List<CategoriaResponseDTO> response = categoriaService.searchByNome(nome);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar categoria")
    public ResponseEntity<CategoriaResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequestDTO request) {
        log.info("PUT /categorias/{}", id);
        CategoriaResponseDTO response = categoriaService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/ativar")
    @Operation(summary = "Ativar categoria")
    public ResponseEntity<CategoriaResponseDTO> ativar(@PathVariable Long id) {
        log.info("PATCH /categorias/{}/ativar", id);
        CategoriaResponseDTO response = categoriaService.ativar(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/desativar")
    @Operation(summary = "Desativar categoria")
    public ResponseEntity<CategoriaResponseDTO> desativar(@PathVariable Long id) {
        log.info("PATCH /categorias/{}/desativar", id);
        CategoriaResponseDTO response = categoriaService.desativar(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar categoria permanentemente")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /categorias/{}", id);
        categoriaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    @Operation(summary = "Contar total de categorias")
    public ResponseEntity<Long> count() {
        log.info("GET /categorias/count");
        Long count = categoriaService.count();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/ativas")
    @Operation(summary = "Contar categorias ativas")
    public ResponseEntity<Long> countAtivas() {
        log.info("GET /categorias/count/ativas");
        Long count = categoriaService.countAtivas();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/tipo/{tipo}")
    @Operation(summary = "Contar categorias por tipo")
    public ResponseEntity<Long> countByTipo(@PathVariable TipoCategoria tipo) {
        log.info("GET /categorias/count/tipo/{}", tipo);
        Long count = categoriaService.countByTipo(tipo);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{id}/count-despesas")
    @Operation(summary = "Contar despesas de uma categoria")
    public ResponseEntity<Long> countDespesas(@PathVariable Long id) {
        log.info("GET /categorias/{}/count-despesas", id);
        Long count = categoriaService.countDespesas(id);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/agrupar-tipo")
    @Operation(summary = "Agrupar categorias por tipo")
    public ResponseEntity<Map<String, Long>> agruparPorTipo() {
        log.info("GET /categorias/agrupar-tipo");
        Map<String, Long> response = categoriaService.agruparPorTipo();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/resumo")
    @Operation(summary = "Resumo de categorias")
    public ResponseEntity<Map<String, Object>> getResumo() {
        log.info("GET /categorias/resumo");
        Map<String, Object> resumo = categoriaService.getResumo();
        return ResponseEntity.ok(resumo);
    }
}