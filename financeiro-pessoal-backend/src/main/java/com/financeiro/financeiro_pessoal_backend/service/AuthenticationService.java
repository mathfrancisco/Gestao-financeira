package com.financeiro.financeiro_pessoal_backend.service;

import com.financeiro.financeiro_pessoal_backend.dto.request.LoginRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.request.RegisterRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.AuthResponseDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.UsuarioResponseDTO;
import com.financeiro.financeiro_pessoal_backend.exception.DuplicateResourceException;
import com.financeiro.financeiro_pessoal_backend.exception.UnauthorizedException;
import com.financeiro.financeiro_pessoal_backend.exception.ValidationException;
import com.financeiro.financeiro_pessoal_backend.mapper.UsuarioMapper;
import com.financeiro.financeiro_pessoal_backend.model.Usuario;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoUsuario;
import com.financeiro.financeiro_pessoal_backend.repository.UsuarioRepository;
import com.financeiro.financeiro_pessoal_backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UsuarioMapper usuarioMapper;

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"
    );

    /**
     * Registra um novo usuário no sistema
     */
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        log.info("Iniciando registro de novo usuário: {}", request.getEmail());

        // Validações
        validateRegistration(request);

        // Verifica duplicidade de email
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            log.warn("Tentativa de registro com email já existente: {}", request.getEmail());
            throw new DuplicateResourceException("Email já cadastrado no sistema");
        }

        // Cria novo usuário
        Usuario usuario = Usuario.builder()
                .email(request.getEmail().toLowerCase().trim())
                .nome(request.getNome().trim())
                .senhaHash(passwordEncoder.encode(request.getSenha()))
                .tipoUsuario(TipoUsuario.USER)
                .ativo(true)
                .build();

        // Salva no banco
        usuario = usuarioRepository.save(usuario);
        log.info("Usuário registrado com sucesso - ID: {}, Email: {}", usuario.getId(), usuario.getEmail());

        // Gera tokens JWT
        String token = jwtService.generateToken(usuario);
        String refreshToken = jwtService.generateRefreshToken(usuario);
        LocalDateTime expiresAt = jwtService.extractExpiration(token);

        // Converte para DTO
        UsuarioResponseDTO usuarioDTO = usuarioMapper.toDto(usuario);

        return AuthResponseDTO.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tipo("Bearer")
                .usuario(usuarioDTO)
                .expiraEm(expiresAt)
                .build();
    }

    /**
     * Realiza login do usuário
     */
    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO request) {
        log.info("Tentativa de login: {}", request.getEmail());

        try {
            // Valida credenciais
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase().trim(),
                            request.getSenha()
                    )
            );

            // Define contexto de segurança
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Busca usuário
            Usuario usuario = usuarioRepository.findByEmail(request.getEmail().toLowerCase().trim())
                    .orElseThrow(() -> new UnauthorizedException("Credenciais inválidas"));

            // Verifica se está ativo
            if (!usuario.getAtivo()) {
                log.warn("Tentativa de login com conta desativada: {}", usuario.getEmail());
                throw new UnauthorizedException("Conta desativada. Entre em contato com o suporte.");
            }

            log.info("Login realizado com sucesso - ID: {}, Email: {}", usuario.getId(), usuario.getEmail());

            // Gera tokens
            String token = jwtService.generateToken(usuario);
            String refreshToken = jwtService.generateRefreshToken(usuario);
            LocalDateTime expiresAt = jwtService.extractExpiration(token);

            // Converte para DTO
            UsuarioResponseDTO usuarioDTO = usuarioMapper.toDto(usuario);

            return AuthResponseDTO.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .tipo("Bearer")
                    .usuario(usuarioDTO)
                    .expiraEm(expiresAt)
                    .build();

        } catch (BadCredentialsException e) {
            log.warn("Falha no login - credenciais inválidas: {}", request.getEmail());
            throw new UnauthorizedException("Email ou senha incorretos");
        }
    }

    /**
     * Renova o token JWT
     */
    @Transactional(readOnly = true)
    public AuthResponseDTO refreshToken(String token) {
        log.info("Renovando token JWT");

        try {
            // Extrai email do token
            String email = jwtService.extractUsername(token);

            if (email == null) {
                throw new UnauthorizedException("Token inválido");
            }

            // Busca usuário
            Usuario usuario = usuarioRepository.findByEmailAndAtivoTrue(email)
                    .orElseThrow(() -> new UnauthorizedException("Usuário não encontrado ou inativo"));

            // Valida token com UserDetails
            if (!jwtService.isTokenValid(token, usuario)) {
                throw new UnauthorizedException("Token inválido ou expirado");
            }

            // Gera novos tokens
            String newToken = jwtService.generateToken(usuario);
            String newRefreshToken = jwtService.generateRefreshToken(usuario);
            LocalDateTime expiresAt = jwtService.extractExpiration(newToken);

            log.info("Token renovado com sucesso - Email: {}", email);

            // Converte para DTO
            UsuarioResponseDTO usuarioDTO = usuarioMapper.toDto(usuario);

            return AuthResponseDTO.builder()
                    .token(newToken)
                    .refreshToken(newRefreshToken)
                    .tipo("Bearer")
                    .usuario(usuarioDTO)
                    .expiraEm(expiresAt)
                    .build();

        } catch (Exception e) {
            log.error("Erro ao renovar token: {}", e.getMessage());
            throw new UnauthorizedException("Não foi possível renovar o token");
        }
    }

    /**
     * Realiza logout (invalidação será feita no frontend)
     */
    public void logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            String email = authentication.getName();
            log.info("Logout realizado - Email: {}", email);
            SecurityContextHolder.clearContext();
        }
    }

    /**
     * Retorna dados do usuário logado
     */
    @Transactional(readOnly = true)
    public UsuarioResponseDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Usuário não autenticado");
        }

        String email = authentication.getName();
        Usuario usuario = usuarioRepository.findByEmailAndAtivoTrue(email)
                .orElseThrow(() -> new UnauthorizedException("Usuário não encontrado"));

        return usuarioMapper.toDto(usuario);
    }

    /**
     * Valida dados de registro
     */
    private void validateRegistration(RegisterRequestDTO request) {
        // Valida email
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ValidationException("Email é obrigatório");
        }
        if (!EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
            throw new ValidationException("Email inválido");
        }

        // Valida nome
        if (request.getNome() == null || request.getNome().trim().isEmpty()) {
            throw new ValidationException("Nome é obrigatório");
        }
        if (request.getNome().trim().length() < 3) {
            throw new ValidationException("Nome deve ter no mínimo 3 caracteres");
        }
        if (request.getNome().trim().length() > 100) {
            throw new ValidationException("Nome deve ter no máximo 100 caracteres");
        }

        // Valida senha
        if (request.getSenha() == null || request.getSenha().isEmpty()) {
            throw new ValidationException("Senha é obrigatória");
        }
        if (!PASSWORD_PATTERN.matcher(request.getSenha()).matches()) {
            throw new ValidationException(
                    "A senha deve ter no mínimo 8 caracteres, incluindo: " +
                            "letra maiúscula, letra minúscula, número e caractere especial"
            );
        }

        // Valida confirmação de senha
        if (request.getConfirmacaoSenha() == null ||
                !request.getSenha().equals(request.getConfirmacaoSenha())) {
            throw new ValidationException("As senhas não coincidem");
        }
    }
}
