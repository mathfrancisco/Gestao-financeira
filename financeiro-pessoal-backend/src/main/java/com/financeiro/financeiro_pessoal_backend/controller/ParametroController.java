package com.financeiro.financeiro_pessoal_backend.controller;

import com.financeiro.financeiro_pessoal_backend.dto.request.ParametroRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.ParametroResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoParametro;
import com.financeiro.financeiro_pessoal_backend.service.ParametroService;
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
@RequestMapping("/parametros")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Parâmetros", description = "Gerenciamento de parâmetros de configuração")
public class ParametroController {

    private final ParametroService parametroService;

    @PostMapping
    @Operation(summary = "Criar novo parâmetro")
    public ResponseEntity<ParametroResponseDTO> create(@Valid @RequestBody ParametroRequestDTO request) {
        log.info("POST /parametros");
        ParametroResponseDTO response = parametroService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar parâmetro por ID")
    public ResponseEntity<ParametroResponseDTO> findById(@PathVariable Long id) {
        log.info("GET /parametros/{}", id);
        ParametroResponseDTO response = parametroService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chave/{chave}")
    @Operation(summary = "Buscar parâmetro por chave")
    public ResponseEntity<ParametroResponseDTO> findByChave(@PathVariable String chave) {
        log.info("GET /parametros/chave/{}", chave);
        ParametroResponseDTO response = parametroService.findByChave(chave);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chave/{chave}/valor")
    @Operation(summary = "Buscar valor de um parâmetro por chave")
    public ResponseEntity<String> findValorByChave(@PathVariable String chave) {
        log.info("GET /parametros/chave/{}/valor", chave);
        String valor = parametroService.findValorByChave(chave);
        return ResponseEntity.ok(valor);
    }

    @GetMapping("/chave/{chave}/valor-integer")
    @Operation(summary = "Buscar valor como Integer")
    public ResponseEntity<Integer> findValorAsInteger(@PathVariable String chave) {
        log.info("GET /parametros/chave/{}/valor-integer", chave);
        Integer valor = parametroService.findValorAsInteger(chave);
        return ResponseEntity.ok(valor);
    }

    @GetMapping("/chave/{chave}/valor-boolean")
    @Operation(summary = "Buscar valor como Boolean")
    public ResponseEntity<Boolean> findValorAsBoolean(@PathVariable String chave) {
        log.info("GET /parametros/chave/{}/valor-boolean", chave);
        Boolean valor = parametroService.findValorAsBoolean(chave);
        return ResponseEntity.ok(valor);
    }

    @GetMapping("/chave/{chave}/valor-double")
    @Operation(summary = "Buscar valor como Double")
    public ResponseEntity<Double> findValorAsDouble(@PathVariable String chave) {
        log.info("GET /parametros/chave/{}/valor-double", chave);
        Double valor = parametroService.findValorAsDouble(chave);
        return ResponseEntity.ok(valor);
    }

    @GetMapping
    @Operation(summary = "Listar todos os parâmetros")
    public ResponseEntity<List<ParametroResponseDTO>> findAll() {
        log.info("GET /parametros");
        List<ParametroResponseDTO> response = parametroService.findAllByUsuario();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tipo/{tipo}")
    @Operation(summary = "Buscar parâmetros por tipo")
    public ResponseEntity<List<ParametroResponseDTO>> findByTipo(@PathVariable TipoParametro tipo) {
        log.info("GET /parametros/tipo/{}", tipo);
        List<ParametroResponseDTO> response = parametroService.findByTipo(tipo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tipo/string")
    @Operation(summary = "Buscar parâmetros do tipo STRING")
    public ResponseEntity<List<ParametroResponseDTO>> findStringParametros() {
        log.info("GET /parametros/tipo/string");
        List<ParametroResponseDTO> response = parametroService.findStringParametros();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tipo/number")
    @Operation(summary = "Buscar parâmetros do tipo NUMBER")
    public ResponseEntity<List<ParametroResponseDTO>> findNumberParametros() {
        log.info("GET /parametros/tipo/number");
        List<ParametroResponseDTO> response = parametroService.findNumberParametros();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tipo/boolean")
    @Operation(summary = "Buscar parâmetros do tipo BOOLEAN")
    public ResponseEntity<List<ParametroResponseDTO>> findBooleanParametros() {
        log.info("GET /parametros/tipo/boolean");
        List<ParametroResponseDTO> response = parametroService.findBooleanParametros();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/com-descricao")
    @Operation(summary = "Buscar parâmetros com descrição")
    public ResponseEntity<List<ParametroResponseDTO>> findWithDescricao() {
        log.info("GET /parametros/com-descricao");
        List<ParametroResponseDTO> response = parametroService.findWithDescricao();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @Operation(summary = "Buscar parâmetros por chave (busca parcial)")
    public ResponseEntity<List<ParametroResponseDTO>> searchByChave(@RequestParam String chave) {
        log.info("GET /parametros/search?chave={}", chave);
        List<ParametroResponseDTO> response = parametroService.searchByChave(chave);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recentes")
    @Operation(summary = "Buscar parâmetros atualizados recentemente")
    public ResponseEntity<List<ParametroResponseDTO>> findRecentlyUpdated() {
        log.info("GET /parametros/recentes");
        List<ParametroResponseDTO> response = parametroService.findRecentlyUpdated();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar parâmetro")
    public ResponseEntity<ParametroResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody ParametroRequestDTO request) {
        log.info("PUT /parametros/{}", id);
        ParametroResponseDTO response = parametroService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/chave/{chave}")
    @Operation(summary = "Atualizar apenas o valor do parâmetro")
    public ResponseEntity<ParametroResponseDTO> updateValor(
            @PathVariable String chave,
            @RequestParam String valor) {
        log.info("PATCH /parametros/chave/{}?valor={}", chave, valor);
        ParametroResponseDTO response = parametroService.updateValor(chave, valor);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar parâmetro por ID")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /parametros/{}", id);
        parametroService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/chave/{chave}")
    @Operation(summary = "Deletar parâmetro por chave")
    public ResponseEntity<Void> deleteByChave(@PathVariable String chave) {
        log.info("DELETE /parametros/chave/{}", chave);
        parametroService.deleteByChave(chave);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    @Operation(summary = "Contar total de parâmetros")
    public ResponseEntity<Long> count() {
        log.info("GET /parametros/count");
        Long count = parametroService.count();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/tipo/{tipo}")
    @Operation(summary = "Contar parâmetros por tipo")
    public ResponseEntity<Long> countByTipo(@PathVariable TipoParametro tipo) {
        log.info("GET /parametros/count/tipo/{}", tipo);
        Long count = parametroService.countByTipo(tipo);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/agrupar-tipo")
    @Operation(summary = "Agrupar parâmetros por tipo")
    public ResponseEntity<Map<String, Long>> agruparPorTipo() {
        log.info("GET /parametros/agrupar-tipo");
        Map<String, Long> response = parametroService.agruparPorTipo();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/exists/{chave}")
    @Operation(summary = "Verificar se parâmetro existe")
    public ResponseEntity<Boolean> exists(@PathVariable String chave) {
        log.info("GET /parametros/exists/{}", chave);
        Boolean exists = parametroService.exists(chave);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/map")
    @Operation(summary = "Retornar todos os parâmetros como Map")
    public ResponseEntity<Map<String, String>> getAllAsMap() {
        log.info("GET /parametros/map");
        Map<String, String> map = parametroService.getAllAsMap();
        return ResponseEntity.ok(map);
    }

    @GetMapping("/resumo")
    @Operation(summary = "Resumo de parâmetros")
    public ResponseEntity<Map<String, Object>> getResumo() {
        log.info("GET /parametros/resumo");
        Map<String, Object> resumo = parametroService.getResumo();
        return ResponseEntity.ok(resumo);
    }
}