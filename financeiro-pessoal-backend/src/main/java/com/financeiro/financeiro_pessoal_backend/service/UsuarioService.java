package com.financeiro.financeiro_pessoal_backend.service;

import com.financeiro.financeiro_pessoal_backend.dto.request.AlterarSenhaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.request.AtualizarUsuarioRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.UsuarioResponseDTO;
import com.financeiro.financeiro_pessoal_backend.exception.ResourceNotFoundException;
import com.financeiro.financeiro_pessoal_backend.exception.UnauthorizedException;
import com.financeiro.financeiro_pessoal_backend.exception.ValidationException;
import com.financeiro.financeiro_pessoal_backend.mapper.UsuarioMapper;
import com.financeiro.financeiro_pessoal_backend.model.Usuario;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoUsuario;
import com.financeiro.financeiro_pessoal_backend.repository.UsuarioRepository;
import com.financeiro.financeiro_pessoal_backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtil securityUtil;

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"
    );

    /**
     * Busca usuário por ID
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "usuarios", key = "#id")
    public UsuarioResponseDTO findById(Long id) {
        log.debug("Buscando usuário por ID: {}", id);

        // Verifica permissão (usuário só pode ver próprio perfil, exceto admin)
        Long usuarioLogadoId = securityUtil.getUsuarioLogadoId();
        if (!id.equals(usuarioLogadoId) && !securityUtil.isAdmin()) {
            log.warn("Usuário {} tentou acessar perfil de outro usuário: {}", usuarioLogadoId, id);
            throw new UnauthorizedException("Você não tem permissão para acessar este perfil");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        log.info("Usuário encontrado - ID: {}, Email: {}", usuario.getId(), usuario.getEmail());
        return usuarioMapper.toDto(usuario);
    }

    /**
     * Busca usuário por email
     */
    @Transactional(readOnly = true)
    public UsuarioResponseDTO findByEmail(String email) {
        log.debug("Buscando usuário por email: {}", email);

        // Apenas admin pode buscar por email de outros usuários
        if (!securityUtil.isAdmin()) {
            String emailLogado = securityUtil.getEmailUsuarioLogado();
            if (!email.equalsIgnoreCase(emailLogado)) {
                throw new UnauthorizedException("Você não tem permissão para realizar esta operação");
            }
        }

        Usuario usuario = usuarioRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com email: " + email));

        return usuarioMapper.toDto(usuario);
    }

    /**
     * Lista todos os usuários ativos (apenas admin)
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "usuarios", key = "'ativos'")
    public List<UsuarioResponseDTO> findAllAtivos() {
        log.debug("Listando todos os usuários ativos");

        // Apenas admin
        if (!securityUtil.isAdmin()) {
            throw new UnauthorizedException("Acesso negado. Apenas administradores podem listar usuários");
        }

        List<Usuario> usuarios = usuarioRepository.findByAtivoTrue();
        log.info("Total de usuários ativos encontrados: {}", usuarios.size());

        return usuarios.stream()
                .map(usuarioMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca usuários por tipo (apenas admin)
     */
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> findByTipo(TipoUsuario tipo) {
        log.debug("Buscando usuários por tipo: {}", tipo);

        // Apenas admin
        if (!securityUtil.isAdmin()) {
            throw new UnauthorizedException("Acesso negado. Apenas administradores podem filtrar usuários por tipo");
        }

        List<Usuario> usuarios = usuarioRepository.findByTipoUsuarioAndAtivoTrue(tipo);
        log.info("Total de usuários encontrados do tipo {}: {}", tipo, usuarios.size());

        return usuarios.stream()
                .map(usuarioMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza perfil do usuário
     */
    @Transactional
    @CacheEvict(value = "usuarios", key = "#id")
    public UsuarioResponseDTO update(Long id, AtualizarUsuarioRequestDTO request) {
        log.info("Atualizando usuário - ID: {}", id);

        // Verifica permissão
        Long usuarioLogadoId = securityUtil.getUsuarioLogadoId();
        if (!id.equals(usuarioLogadoId) && !securityUtil.isAdmin()) {
            log.warn("Usuário {} tentou atualizar perfil de outro usuário: {}", usuarioLogadoId, id);
            throw new UnauthorizedException("Você não tem permissão para atualizar este perfil");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        // Valida e atualiza nome
        if (request.getNome() != null && !request.getNome().trim().isEmpty()) {
            validateNome(request.getNome());
            usuario.setNome(request.getNome().trim());
            log.debug("Nome atualizado para: {}", request.getNome());
        }

        // Atualiza foto URL
        if (request.getFotoUrl() != null) {
            usuario.setFotoUrl(request.getFotoUrl().trim());
            log.debug("Foto URL atualizada");
        }

        // Apenas admin pode alterar tipo de usuário
        if (request.getTipoUsuario() != null) {
            if (!securityUtil.isAdmin()) {
                throw new UnauthorizedException("Apenas administradores podem alterar o tipo de usuário");
            }
            usuario.setTipoUsuario(request.getTipoUsuario());
            log.info("Tipo de usuário alterado para: {}", request.getTipoUsuario());
        }

        usuario = usuarioRepository.save(usuario);
        log.info("Usuário atualizado com sucesso - ID: {}", usuario.getId());

        return usuarioMapper.toDto(usuario);
    }

    /**
     * Altera senha do usuário
     */
    @Transactional
    @CacheEvict(value = "usuarios", key = "#id")
    public void alterarSenha(Long id, AlterarSenhaRequestDTO request) {
        log.info("Alterando senha do usuário - ID: {}", id);

        // Verifica permissão
        Long usuarioLogadoId = securityUtil.getUsuarioLogadoId();
        if (!id.equals(usuarioLogadoId)) {
            log.warn("Usuário {} tentou alterar senha de outro usuário: {}", usuarioLogadoId, id);
            throw new UnauthorizedException("Você não tem permissão para alterar a senha deste usuário");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        // Valida senha atual
        if (!passwordEncoder.matches(request.getSenhaAtual(), usuario.getSenhaHash())) {
            log.warn("Senha atual incorreta para usuário ID: {}", id);
            throw new ValidationException("Senha atual incorreta");
        }

        // Valida nova senha
        if (!PASSWORD_PATTERN.matcher(request.getNovaSenha()).matches()) {
            throw new ValidationException(
                    "A nova senha deve ter no mínimo 8 caracteres, incluindo: " +
                            "letra maiúscula, letra minúscula, número e caractere especial"
            );
        }

        // Valida confirmação
        if (!request.getNovaSenha().equals(request.getConfirmacaoSenha())) {
            throw new ValidationException("A nova senha e a confirmação não coincidem");
        }

        // Verifica se nova senha é diferente da atual
        if (passwordEncoder.matches(request.getNovaSenha(), usuario.getSenhaHash())) {
            throw new ValidationException("A nova senha deve ser diferente da senha atual");
        }

        // Atualiza senha
        usuario.setSenhaHash(passwordEncoder.encode(request.getNovaSenha()));
        usuarioRepository.save(usuario);

        log.info("Senha alterada com sucesso para usuário ID: {}", id);
    }

    /**
     * Desativa conta do usuário (soft delete)
     */
    @Transactional
    @CacheEvict(value = "usuarios", allEntries = true)
    public void desativar(Long id) {
        log.info("Desativando usuário - ID: {}", id);

        // Verifica permissão
        Long usuarioLogadoId = securityUtil.getUsuarioLogadoId();
        if (!id.equals(usuarioLogadoId) && !securityUtil.isAdmin()) {
            log.warn("Usuário {} tentou desativar conta de outro usuário: {}", usuarioLogadoId, id);
            throw new UnauthorizedException("Você não tem permissão para desativar esta conta");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        if (!usuario.getAtivo()) {
            throw new ValidationException("Usuário já está desativado");
        }

        usuario.setAtivo(false);
        usuarioRepository.save(usuario);

        log.info("Usuário desativado com sucesso - ID: {}, Email: {}", usuario.getId(), usuario.getEmail());
    }

    /**
     * Reativa conta do usuário (apenas admin)
     */
    @Transactional
    @CacheEvict(value = "usuarios", allEntries = true)
    public void reativar(Long id) {
        log.info("Reativando usuário - ID: {}", id);

        // Apenas admin
        if (!securityUtil.isAdmin()) {
            throw new UnauthorizedException("Apenas administradores podem reativar contas");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        if (usuario.getAtivo()) {
            throw new ValidationException("Usuário já está ativo");
        }

        usuario.setAtivo(true);
        usuarioRepository.save(usuario);

        log.info("Usuário reativado com sucesso - ID: {}, Email: {}", usuario.getId(), usuario.getEmail());
    }

    /**
     * Busca usuários por nome (apenas admin)
     */
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> searchByNome(String nome) {
        log.debug("Buscando usuários por nome: {}", nome);

        // Apenas admin
        if (!securityUtil.isAdmin()) {
            throw new UnauthorizedException("Apenas administradores podem buscar usuários por nome");
        }

        if (nome == null || nome.trim().length() < 2) {
            throw new ValidationException("O termo de busca deve ter no mínimo 2 caracteres");
        }

        List<Usuario> usuarios = usuarioRepository.findByNomeContainingIgnoreCaseAndAtivoTrue(nome.trim());
        log.info("Total de usuários encontrados com nome '{}': {}", nome, usuarios.size());

        return usuarios.stream()
                .map(usuarioMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Conta total de usuários ativos (apenas admin)
     */
    @Transactional(readOnly = true)
    public Long countAtivos() {
        if (!securityUtil.isAdmin()) {
            throw new UnauthorizedException("Apenas administradores podem visualizar estatísticas");
        }

        Long count = usuarioRepository.countAtivos();
        log.debug("Total de usuários ativos: {}", count);
        return count;
    }

    /**
     * Conta usuários por tipo (apenas admin)
     */
    @Transactional(readOnly = true)
    public Long countByTipo(TipoUsuario tipo) {
        if (!securityUtil.isAdmin()) {
            throw new UnauthorizedException("Apenas administradores podem visualizar estatísticas");
        }

        Long count = usuarioRepository.countByTipoUsuario(tipo);
        log.debug("Total de usuários do tipo {}: {}", tipo, count);
        return count;
    }

    /**
     * Valida nome do usuário
     */
    private void validateNome(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            throw new ValidationException("Nome é obrigatório");
        }
        if (nome.trim().length() < 3) {
            throw new ValidationException("Nome deve ter no mínimo 3 caracteres");
        }
        if (nome.trim().length() > 100) {
            throw new ValidationException("Nome deve ter no máximo 100 caracteres");
        }
    }
}