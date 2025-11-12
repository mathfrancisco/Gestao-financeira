package com.financeiro.financeiro_pessoal_backend.controller;

import com.financeiro.financeiro_pessoal_backend.dto.request.LoginRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.request.RefreshTokenRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.request.RegisterRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.AuthResponseDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.UsuarioResponseDTO;
import com.financeiro.financeiro_pessoal_backend.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Autenticação", description = "Endpoints de autenticação e gerenciamento de sessão")
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    @Operation(summary = "Registrar novo usuário", description = "Cria uma nova conta de usuário")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        log.info("POST /auth/register - Email: {}", request.getEmail());
        AuthResponseDTO response = authenticationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Autentica usuário e retorna token JWT")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        log.info("POST /auth/login - Email: {}", request.getEmail());
        AuthResponseDTO response = authenticationService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar token", description = "Renova token JWT usando refresh token")
    public ResponseEntity refreshToken(
            @RequestBody RefreshTokenRequestDTO request) {
        log.info("POST /auth/refresh");

        // Valida refresh token separado do access token
        AuthResponseDTO response = authenticationService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Invalida sessão do usuário")
    public ResponseEntity<Void> logout() {
        log.info("POST /auth/logout");
        authenticationService.logout();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Usuário logado", description = "Retorna dados do usuário autenticado")
    public ResponseEntity<UsuarioResponseDTO> getCurrentUser() {
        log.info("GET /auth/me");
        UsuarioResponseDTO response = authenticationService.getCurrentUser();
        return ResponseEntity.ok(response);
    }
}