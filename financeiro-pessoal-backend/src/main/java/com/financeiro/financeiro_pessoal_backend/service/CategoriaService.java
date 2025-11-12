package com.financeiro.financeiro_pessoal_backend.service;

import com.financeiro.financeiro_pessoal_backend.dto.request.CategoriaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.CategoriaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.exception.DuplicateResourceException;
import com.financeiro.financeiro_pessoal_backend.exception.ResourceNotFoundException;
import com.financeiro.financeiro_pessoal_backend.exception.ValidationException;
import com.financeiro.financeiro_pessoal_backend.mapper.CategoriaMapper;
import com.financeiro.financeiro_pessoal_backend.model.Categoria;
import com.financeiro.financeiro_pessoal_backend.model.Usuario;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoCategoria;
import com.financeiro.financeiro_pessoal_backend.repository.CategoriaRepository;
import com.financeiro.financeiro_pessoal_backend.repository.UsuarioRepository;
import com.financeiro.financeiro_pessoal_backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaMapper categoriaMapper;
    private final SecurityUtil securityUtil;

    /**
     * Cria uma nova categoria
     */
    @Transactional
    @CacheEvict(value = {"categorias", "despesas"}, allEntries = true)
    public CategoriaResponseDTO create(CategoriaRequestDTO request) {
        log.info("Criando nova categoria: {}", request.getNome());

        Long usuarioId = securityUtil.getUsuarioLogadoId();

        // Busca usuário
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        // Validações
        validateCategoria(request, null, usuarioId);

        // Verifica duplicidade
        if (categoriaRepository.existsByUsuarioIdAndNome(usuarioId, request.getNome())) {
            throw new DuplicateResourceException("Já existe uma categoria com este nome");
        }

        // Cria categoria
        Categoria categoria = Categoria.builder()
                .usuario(usuario)
                .nome(request.getNome().trim())
                .tipo(request.getTipo())
                .ativa(true)
                .build();

        categoria = categoriaRepository.save(categoria);
        log.info("Categoria criada com sucesso - ID: {}, Nome: {}, Tipo: {}",
                categoria.getId(), categoria.getNome(), categoria.getTipo());

        return categoriaMapper.toDto(categoria);
    }

    /**
     * Busca categoria por ID
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "categorias", key = "#id")
    public CategoriaResponseDTO findById(Long id) {
        log.debug("Buscando categoria por ID: {}", id);

        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(categoria.getUsuario().getId());

        return categoriaMapper.toDto(categoria);
    }

    /**
     * Busca categoria por ID com despesas
     */
    @Transactional(readOnly = true)
    public CategoriaResponseDTO findByIdWithDespesas(Long id) {
        log.debug("Buscando categoria com despesas - ID: {}", id);

        Categoria categoria = categoriaRepository.findByIdWithDespesas(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(categoria.getUsuario().getId());

        return categoriaMapper.toDtoWithDespesas(categoria);
    }

    /**
     * Lista todas as categorias do usuário
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "categorias", key = "'usuario_' + #root.target.securityUtil.usuarioLogadoId")
    public List<CategoriaResponseDTO> findAllByUsuario() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Listando categorias do usuário: {}", usuarioId);

        List<Categoria> categorias = categoriaRepository.findByUsuarioIdOrderByNomeAsc(usuarioId);
        log.info("Total de categorias encontradas: {}", categorias.size());

        return categorias.stream()
                .map(categoriaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Lista categorias ativas
     */
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> findAtivas() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Listando categorias ativas do usuário: {}", usuarioId);

        List<Categoria> categorias = categoriaRepository.findAtivasByUsuarioId(usuarioId);
        log.info("Total de categorias ativas: {}", categorias.size());

        return categorias.stream()
                .map(categoriaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca categorias por tipo
     */
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> findByTipo(TipoCategoria tipo) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando categorias do tipo: {}", tipo);

        List<Categoria> categorias = categoriaRepository.findByUsuarioIdAndTipo(usuarioId, tipo);
        log.info("Categorias encontradas do tipo {}: {}", tipo, categorias.size());

        return categorias.stream()
                .map(categoriaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca categorias ativas por tipo
     */
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> findAtivasByTipo(TipoCategoria tipo) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando categorias ativas do tipo: {}", tipo);

        List<Categoria> categorias = categoriaRepository.findAtivasByUsuarioIdAndTipo(usuarioId, tipo);
        log.info("Categorias ativas encontradas do tipo {}: {}", tipo, categorias.size());

        return categorias.stream()
                .map(categoriaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca categorias de despesa ativas
     */
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> findCategoriasDespesaAtivas() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando categorias de despesa ativas");

        List<Categoria> categorias = categoriaRepository.findCategoriasDespesaAtivas(usuarioId);
        log.info("Total de categorias de despesa ativas: {}", categorias.size());

        return categorias.stream()
                .map(categoriaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca categorias de receita ativas
     */
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> findCategoriasReceitaAtivas() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando categorias de receita ativas");

        List<Categoria> categorias = categoriaRepository.findCategoriasReceitaAtivas(usuarioId);
        log.info("Total de categorias de receita ativas: {}", categorias.size());

        return categorias.stream()
                .map(categoriaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca categorias com despesas associadas
     */
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> findCategoriasComDespesas() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando categorias com despesas associadas");

        List<Categoria> categorias = categoriaRepository.findCategoriasComDespesas(usuarioId);
        log.info("Categorias com despesas: {}", categorias.size());

        return categorias.stream()
                .map(categoriaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca categorias sem despesas associadas
     */
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> findCategoriasSemDespesas() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando categorias sem despesas associadas");

        List<Categoria> categorias = categoriaRepository.findCategoriasSemDespesas(usuarioId);
        log.info("Categorias sem despesas: {}", categorias.size());

        return categorias.stream()
                .map(categoriaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca categorias mais usadas
     */
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> findMaisUsadas() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando categorias mais usadas");

        List<Categoria> categorias = categoriaRepository.findMaisUsadasByUsuarioId(usuarioId);
        log.info("Categorias mais usadas encontradas: {}", categorias.size());

        return categorias.stream()
                .map(categoriaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca categorias por nome
     */
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> searchByNome(String nome) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando categorias por nome: {}", nome);

        if (nome == null || nome.trim().length() < 2) {
            throw new ValidationException("O termo de busca deve ter no mínimo 2 caracteres");
        }

        List<Categoria> categorias = categoriaRepository.findByUsuarioIdAndNomeContaining(usuarioId, nome);
        log.info("Categorias encontradas com nome '{}': {}", nome, categorias.size());

        return categorias.stream()
                .map(categoriaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza categoria
     */
    @Transactional
    @CacheEvict(value = {"categorias", "despesas"}, allEntries = true)
    public CategoriaResponseDTO update(Long id, CategoriaRequestDTO request) {
        log.info("Atualizando categoria - ID: {}", id);

        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(categoria.getUsuario().getId());

        // Validações
        validateCategoria(request, id, categoria.getUsuario().getId());

        // Verifica duplicidade (excluindo a própria categoria)
        if (categoriaRepository.existsByUsuarioIdAndNomeAndIdNot(
                categoria.getUsuario().getId(), request.getNome(), id)) {
            throw new DuplicateResourceException("Já existe uma categoria com este nome");
        }

        // Atualiza dados
        categoria.setNome(request.getNome().trim());
        categoria.setTipo(request.getTipo());

        categoria = categoriaRepository.save(categoria);
        log.info("Categoria atualizada com sucesso - ID: {}, Nome: {}",
                categoria.getId(), categoria.getNome());

        return categoriaMapper.toDto(categoria);
    }

    /**
     * Ativa categoria
     */
    @Transactional
    @CacheEvict(value = {"categorias", "despesas"}, allEntries = true)
    public CategoriaResponseDTO ativar(Long id) {
        log.info("Ativando categoria - ID: {}", id);

        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(categoria.getUsuario().getId());

        if (categoria.getAtiva()) {
            throw new ValidationException("Categoria já está ativa");
        }

        categoria.ativar();
        categoria = categoriaRepository.save(categoria);

        log.info("Categoria ativada com sucesso - ID: {}", id);
        return categoriaMapper.toDto(categoria);
    }

    /**
     * Desativa categoria (soft delete)
     */
    @Transactional
    @CacheEvict(value = {"categorias", "despesas"}, allEntries = true)
    public CategoriaResponseDTO desativar(Long id) {
        log.info("Desativando categoria - ID: {}", id);

        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(categoria.getUsuario().getId());

        if (!categoria.getAtiva()) {
            throw new ValidationException("Categoria já está desativada");
        }

        categoria.desativar();
        categoria = categoriaRepository.save(categoria);

        log.info("Categoria desativada com sucesso - ID: {}", id);
        return categoriaMapper.toDto(categoria);
    }

    /**
     * Deleta categoria permanentemente
     */
    @Transactional
    @CacheEvict(value = {"categorias", "despesas"}, allEntries = true)
    public void delete(Long id) {
        log.info("Deletando categoria - ID: {}", id);

        Categoria categoria = categoriaRepository.findByIdWithDespesas(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(categoria.getUsuario().getId());

        // Verifica se há despesas associadas
        Long countDespesas = categoriaRepository.countDespesasByCategoriaId(id);
        if (countDespesas > 0) {
            throw new ValidationException(
                    "Não é possível deletar categoria com despesas associadas. " +
                            "Total de despesas: " + countDespesas + ". " +
                            "Desative a categoria ao invés de deletá-la."
            );
        }

        categoriaRepository.delete(categoria);
        log.info("Categoria deletada com sucesso - ID: {}", id);
    }

    /**
     * Conta total de categorias
     */
    @Transactional(readOnly = true)
    public Long count() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        Long count = categoriaRepository.countByUsuarioId(usuarioId);
        log.debug("Total de categorias do usuário {}: {}", usuarioId, count);
        return count;
    }

    /**
     * Conta categorias ativas
     */
    @Transactional(readOnly = true)
    public Long countAtivas() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        Long count = categoriaRepository.countAtivasByUsuarioId(usuarioId);
        log.debug("Total de categorias ativas do usuário {}: {}", usuarioId, count);
        return count;
    }

    /**
     * Conta categorias por tipo
     */
    @Transactional(readOnly = true)
    public Long countByTipo(TipoCategoria tipo) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        Long count = categoriaRepository.countByUsuarioIdAndTipo(usuarioId, tipo);
        log.debug("Total de categorias do tipo {} do usuário {}: {}", tipo, usuarioId, count);
        return count;
    }

    /**
     * Conta despesas de uma categoria
     */
    @Transactional(readOnly = true)
    public Long countDespesas(Long categoriaId) {
        // Valida que categoria existe e pertence ao usuário
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        securityUtil.validarPermissaoUsuario(categoria.getUsuario().getId());

        Long count = categoriaRepository.countDespesasByCategoriaId(categoriaId);
        log.debug("Total de despesas da categoria {}: {}", categoriaId, count);
        return count;
    }

    /**
     * Agrupa categorias por tipo
     */
    @Transactional(readOnly = true)
    public Map<String, Long> agruparPorTipo() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Agrupando categorias por tipo");

        List<Object[]> results = categoriaRepository.groupByTipo(usuarioId);

        Map<String, Long> grouped = new HashMap<>();
        for (Object[] result : results) {
            TipoCategoria tipo = (TipoCategoria) result[0];
            Long quantidade = ((Number) result[1]).longValue();
            grouped.put(tipo.name(), quantidade);
        }

        log.info("Categorias agrupadas por tipo: {}", grouped);
        return grouped;
    }

    /**
     * Resumo de categorias
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getResumo() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Gerando resumo de categorias do usuário: {}", usuarioId);

        Long total = categoriaRepository.countByUsuarioId(usuarioId);
        Long ativas = categoriaRepository.countAtivasByUsuarioId(usuarioId);
        Long despesas = categoriaRepository.countByUsuarioIdAndTipo(usuarioId, TipoCategoria.DESPESA);
        Long receitas = categoriaRepository.countByUsuarioIdAndTipo(usuarioId, TipoCategoria.RECEITA);

        Map<String, Object> resumo = new HashMap<>();
        resumo.put("total", total);
        resumo.put("ativas", ativas);
        resumo.put("inativas", total - ativas);
        resumo.put("despesas", despesas);
        resumo.put("receitas", receitas);
        resumo.put("porTipo", agruparPorTipo());

        log.info("Resumo de categorias gerado - Total: {}, Ativas: {}", total, ativas);
        return resumo;
    }

    /**
     * Valida dados da categoria
     */
    private void validateCategoria(CategoriaRequestDTO request, Long categoriaId, Long usuarioId) {
        if (request.getNome() == null || request.getNome().trim().isEmpty()) {
            throw new ValidationException("Nome é obrigatório");
        }
        if (request.getNome().trim().length() < 2) {
            throw new ValidationException("Nome deve ter no mínimo 2 caracteres");
        }
        if (request.getNome().trim().length() > 100) {
            throw new ValidationException("Nome deve ter no máximo 100 caracteres");
        }
        if (request.getTipo() == null) {
            throw new ValidationException("Tipo é obrigatório");
        }
    }
}