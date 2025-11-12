package com.financeiro.financeiro_pessoal_backend.controller;

import com.financeiro.financeiro_pessoal_backend.dto.request.AlterarSenhaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.request.AtualizarUsuarioRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.UsuarioResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoUsuario;
import com.financeiro.financeiro_pessoal_backend.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Usuários", description = "Gerenciamento de usuários")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/{id}")
    @Operation(summary = "Buscar usuário por ID")
    public ResponseEntity<UsuarioResponseDTO> findById(@PathVariable Long id) {
        log.info("GET /usuarios/{}", id);
        UsuarioResponseDTO response = usuarioService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Buscar usuário por email")
    public ResponseEntity<UsuarioResponseDTO> findByEmail(@PathVariable String email) {
        log.info("GET /usuarios/email/{}", email);
        UsuarioResponseDTO response = usuarioService.findByEmail(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ativos")
    @Operation(summary = "Listar usuários ativos", description = "Apenas admin")
    public ResponseEntity<List<UsuarioResponseDTO>> findAllAtivos() {
        log.info("GET /usuarios/ativos");
        List<UsuarioResponseDTO> response = usuarioService.findAllAtivos();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tipo/{tipo}")
    @Operation(summary = "Buscar usuários por tipo", description = "Apenas admin")
    public ResponseEntity<List<UsuarioResponseDTO>> findByTipo(@PathVariable TipoUsuario tipo) {
        log.info("GET /usuarios/tipo/{}", tipo);
        List<UsuarioResponseDTO> response = usuarioService.findByTipo(tipo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @Operation(summary = "Buscar usuários por nome", description = "Apenas admin")
    public ResponseEntity<List<UsuarioResponseDTO>> searchByNome(@RequestParam String nome) {
        log.info("GET /usuarios/search?nome={}", nome);
        List<UsuarioResponseDTO> response = usuarioService.searchByNome(nome);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar perfil do usuário")
    public ResponseEntity<UsuarioResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarUsuarioRequestDTO request) {
        log.info("PUT /usuarios/{}", id);
        UsuarioResponseDTO response = usuarioService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/senha")
    @Operation(summary = "Alterar senha do usuário")
    public ResponseEntity<Void> alterarSenha(
            @PathVariable Long id,
            @Valid @RequestBody AlterarSenhaRequestDTO request) {
        log.info("PUT /usuarios/{}/senha", id);
        usuarioService.alterarSenha(id, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativar conta do usuário")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        log.info("DELETE /usuarios/{}", id);
        usuarioService.desativar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reativar")
    @Operation(summary = "Reativar conta do usuário", description = "Apenas admin")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        log.info("PUT /usuarios/{}/reativar", id);
        usuarioService.reativar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count/ativos")
    @Operation(summary = "Contar usuários ativos", description = "Apenas admin")
    public ResponseEntity<Long> countAtivos() {
        log.info("GET /usuarios/count/ativos");
        Long count = usuarioService.countAtivos();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/tipo/{tipo}")
    @Operation(summary = "Contar usuários por tipo", description = "Apenas admin")
    public ResponseEntity<Long> countByTipo(@PathVariable TipoUsuario tipo) {
        log.info("GET /usuarios/count/tipo/{}", tipo);
        Long count = usuarioService.countByTipo(tipo);
        return ResponseEntity.ok(count);
    }
}