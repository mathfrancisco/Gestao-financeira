package com.financeiro.financeiro_pessoal_backend.service;

import com.financeiro.financeiro_pessoal_backend.dto.request.AporteMetaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.request.MetaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.MetaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.TransacaoMetaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.exception.ResourceNotFoundException;
import com.financeiro.financeiro_pessoal_backend.exception.ValidationException;
import com.financeiro.financeiro_pessoal_backend.mapper.MetaMapper;
import com.financeiro.financeiro_pessoal_backend.model.Meta;
import com.financeiro.financeiro_pessoal_backend.model.TransacaoMeta;
import com.financeiro.financeiro_pessoal_backend.model.Usuario;
import com.financeiro.financeiro_pessoal_backend.model.enums.StatusMeta;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoMeta;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoTransacao;
import com.financeiro.financeiro_pessoal_backend.repository.MetaRepository;
import com.financeiro.financeiro_pessoal_backend.repository.TransacaoMetaRepository;
import com.financeiro.financeiro_pessoal_backend.repository.UsuarioRepository;
import com.financeiro.financeiro_pessoal_backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetaService {

    private final MetaRepository metaRepository;
    private final UsuarioRepository usuarioRepository;
    private final TransacaoMetaRepository transacaoMetaRepository;
    private final MetaMapper metaMapper;
    private final TransacaoMetaService transacaoMetaService;
    private final SecurityUtil securityUtil;

    /**
     * Cria uma nova meta
     */
    @Transactional
    @CacheEvict(value = {"metas", "dashboard"}, allEntries = true)
    public MetaResponseDTO create(MetaRequestDTO request) {
        log.info("Criando nova meta: {}", request.getNome());

        Long usuarioId = securityUtil.getUsuarioLogadoId();

        // Busca usuário
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        // Validações
        validateMeta(request);

        // Cria meta
        Meta meta = Meta.builder()
                .usuario(usuario)
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .tipo(request.getTipo() != null ? request.getTipo() : TipoMeta.ECONOMIA)
                .valorObjetivo(request.getValorObjetivo())
                .valorAtual(BigDecimal.ZERO)
                .prazo(request.getPrazo())
                .status(StatusMeta.EM_ANDAMENTO)
                .progresso(BigDecimal.ZERO)
                .observacoes(request.getObservacoes())
                .build();

        meta = metaRepository.save(meta);
        log.info("Meta criada com sucesso - ID: {}, Objetivo: {}",
                meta.getId(), meta.getValorObjetivo());

        return metaMapper.toDto(meta);
    }

    /**
     * Busca meta por ID
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "metas", key = "#id")
    public MetaResponseDTO findById(Long id) {
        log.debug("Buscando meta por ID: {}", id);

        Meta meta = metaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(meta.getUsuario().getId());

        return metaMapper.toDto(meta);
    }

    /**
     * Busca meta por ID com transações
     */
    @Transactional(readOnly = true)
    public MetaResponseDTO findByIdWithTransacoes(Long id) {
        log.debug("Buscando meta com transações - ID: {}", id);

        Meta meta = metaRepository.findByIdWithTransacoes(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(meta.getUsuario().getId());

        return metaMapper.toDtoWithTransacoes(meta);
    }

    /**
     * Lista todas as metas do usuário com paginação
     */
    @Transactional(readOnly = true)
    public Page<MetaResponseDTO> findAllByUsuario(Pageable pageable) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Listando metas do usuário {} - Página: {}", usuarioId, pageable.getPageNumber());

        List<Meta> metas = metaRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId);

        // Aplica paginação
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), metas.size());
        List<Meta> pageContent = metas.subList(start, end);

        List<MetaResponseDTO> dtos = pageContent.stream()
                .map(metaMapper::toDto)
                .collect(Collectors.toList());

        log.info("Total de metas encontradas: {}", metas.size());
        return new PageImpl<>(dtos, pageable, metas.size());
    }

    /**
     * Busca metas por status
     */
    @Transactional(readOnly = true)
    public Page<MetaResponseDTO> findByStatus(StatusMeta status, Pageable pageable) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando metas com status: {}", status);

        List<Meta> metas = metaRepository.findByUsuarioIdAndStatus(usuarioId, status);

        // Aplica paginação
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), metas.size());
        List<Meta> pageContent = metas.subList(start, end);

        List<MetaResponseDTO> dtos = pageContent.stream()
                .map(metaMapper::toDto)
                .collect(Collectors.toList());

        log.info("Metas encontradas com status {}: {}", status, metas.size());
        return new PageImpl<>(dtos, pageable, metas.size());
    }

    /**
     * Busca metas em andamento
     */
    @Transactional(readOnly = true)
    public List<MetaResponseDTO> findEmAndamento() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando metas em andamento do usuário: {}", usuarioId);

        List<Meta> metas = metaRepository.findEmAndamentoByUsuarioId(usuarioId);
        log.info("Total de metas em andamento: {}", metas.size());

        return metas.stream()
                .map(metaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca metas concluídas
     */
    @Transactional(readOnly = true)
    public List<MetaResponseDTO> findConcluidas() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando metas concluídas do usuário: {}", usuarioId);

        List<Meta> metas = metaRepository.findConcluidasByUsuarioId(usuarioId);
        log.info("Total de metas concluídas: {}", metas.size());

        return metas.stream()
                .map(metaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca metas por tipo
     */
    @Transactional(readOnly = true)
    public List<MetaResponseDTO> findByTipo(TipoMeta tipo) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando metas do tipo: {}", tipo);

        List<Meta> metas = metaRepository.findByUsuarioIdAndTipo(usuarioId, tipo);
        log.info("Metas encontradas do tipo {}: {}", tipo, metas.size());

        return metas.stream()
                .map(metaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca metas vencidas
     */
    @Transactional(readOnly = true)
    public List<MetaResponseDTO> findVencidas() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando metas vencidas do usuário: {}", usuarioId);

        List<Meta> metas = metaRepository.findVencidasByUsuarioId(usuarioId);
        log.warn("Total de metas vencidas: {}", metas.size());

        return metas.stream()
                .map(metaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca metas próximas do vencimento (30 dias)
     */
    @Transactional(readOnly = true)
    public List<MetaResponseDTO> findProximasVencimento() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        LocalDate dataLimite = LocalDate.now().plusDays(30);
        log.debug("Buscando metas próximas do vencimento até: {}", dataLimite);

        List<Meta> metas = metaRepository.findProximasVencimentoByUsuarioId(usuarioId, dataLimite);
        log.info("Metas próximas do vencimento: {}", metas.size());

        return metas.stream()
                .map(metaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca metas por período de prazo
     */
    @Transactional(readOnly = true)
    public List<MetaResponseDTO> findByPrazoBetween(LocalDate inicio, LocalDate fim) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando metas com prazo entre {} e {}", inicio, fim);

        validatePeriodo(inicio, fim);

        List<Meta> metas = metaRepository.findByUsuarioIdAndPrazoBetween(usuarioId, inicio, fim);
        log.info("Metas encontradas no período: {}", metas.size());

        return metas.stream()
                .map(metaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza meta
     */
    @Transactional
    @CacheEvict(value = {"metas", "dashboard"}, allEntries = true)
    public MetaResponseDTO update(Long id, MetaRequestDTO request) {
        log.info("Atualizando meta - ID: {}", id);

        Meta meta = metaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(meta.getUsuario().getId());

        // Validações
        validateMeta(request);

        // Atualiza dados
        meta.setNome(request.getNome());
        meta.setDescricao(request.getDescricao());
        meta.setTipo(request.getTipo() != null ? request.getTipo() : TipoMeta.ECONOMIA);
        meta.setValorObjetivo(request.getValorObjetivo());
        meta.setPrazo(request.getPrazo());
        meta.setObservacoes(request.getObservacoes());

        // Recalcula progresso e status
        meta.calcularProgresso();
        meta.atualizarStatus();

        meta = metaRepository.save(meta);
        log.info("Meta atualizada com sucesso - ID: {}, Progresso: {}%",
                meta.getId(), meta.getProgresso());

        return metaMapper.toDto(meta);
    }

    /**
     * Adiciona aporte à meta
     */
    @Transactional
    @CacheEvict(value = {"metas", "dashboard"}, allEntries = true)
    public MetaResponseDTO adicionarAporte(Long id, AporteMetaRequestDTO request) {
        log.info("Adicionando aporte à meta - ID: {}, Valor: {}", id, request.getValor());

        Meta meta = metaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(meta.getUsuario().getId());

        // Valida status da meta
        if (meta.getStatus() == StatusMeta.CONCLUIDA) {
            throw new ValidationException("Não é possível adicionar aportes a uma meta concluída");
        }
        if (meta.getStatus() == StatusMeta.CANCELADA) {
            throw new ValidationException("Não é possível adicionar aportes a uma meta cancelada");
        }

        // Valida valor
        if (request.getValor() == null || request.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Valor do aporte deve ser positivo");
        }

        // Cria transação de aporte
        TransacaoMeta transacao = TransacaoMeta.builder()
                .meta(meta)
                .valor(request.getValor())
                .descricao(request.getDescricao())
                .tipo(TipoTransacao.APORTE)
                .build();

        transacao = transacaoMetaRepository.save(transacao);

        // Atualiza valor atual da meta
        meta.setValorAtual(meta.getValorAtual().add(request.getValor()));
        meta.calcularProgresso();
        meta.atualizarStatus();

        meta = metaRepository.save(meta);

        log.info("Aporte adicionado com sucesso - Meta ID: {}, Novo valor atual: {}, Progresso: {}%",
                meta.getId(), meta.getValorAtual(), meta.getProgresso());

        return metaMapper.toDto(meta);
    }

    /**
     * Adiciona resgate à meta
     */
    @Transactional
    @CacheEvict(value = {"metas", "dashboard"}, allEntries = true)
    public MetaResponseDTO adicionarResgate(Long id, AporteMetaRequestDTO request) {
        log.info("Adicionando resgate à meta - ID: {}, Valor: {}", id, request.getValor());

        Meta meta = metaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(meta.getUsuario().getId());

        // Valida valor
        if (request.getValor() == null || request.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Valor do resgate deve ser positivo");
        }

        // Valida se há saldo suficiente
        if (meta.getValorAtual().compareTo(request.getValor()) < 0) {
            throw new ValidationException("Saldo insuficiente na meta. Saldo atual: " + meta.getValorAtual());
        }

        // Cria transação de resgate
        TransacaoMeta transacao = TransacaoMeta.builder()
                .meta(meta)
                .valor(request.getValor())
                .descricao(request.getDescricao())
                .tipo(TipoTransacao.RESGATE)
                .build();

        transacao = transacaoMetaRepository.save(transacao);

        // Atualiza valor atual da meta
        meta.setValorAtual(meta.getValorAtual().subtract(request.getValor()));
        meta.calcularProgresso();
        meta.atualizarStatus();

        meta = metaRepository.save(meta);

        log.info("Resgate adicionado com sucesso - Meta ID: {}, Novo valor atual: {}, Progresso: {}%",
                meta.getId(), meta.getValorAtual(), meta.getProgresso());

        return metaMapper.toDto(meta);
    }

    /**
     * Cancela meta
     */
    @Transactional
    @CacheEvict(value = {"metas", "dashboard"}, allEntries = true)
    public MetaResponseDTO cancelar(Long id) {
        log.info("Cancelando meta - ID: {}", id);

        Meta meta = metaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(meta.getUsuario().getId());

        // Valida status
        if (meta.getStatus() == StatusMeta.CONCLUIDA) {
            throw new ValidationException("Não é possível cancelar uma meta concluída");
        }
        if (meta.getStatus() == StatusMeta.CANCELADA) {
            throw new ValidationException("Meta já está cancelada");
        }

        meta.setStatus(StatusMeta.CANCELADA);
        meta = metaRepository.save(meta);

        log.info("Meta cancelada com sucesso - ID: {}", id);
        return metaMapper.toDto(meta);
    }

    /**
     * Pausa meta
     */
    @Transactional
    @CacheEvict(value = {"metas", "dashboard"}, allEntries = true)
    public MetaResponseDTO pausar(Long id) {
        log.info("Pausando meta - ID: {}", id);

        Meta meta = metaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(meta.getUsuario().getId());

        // Valida status
        if (meta.getStatus() != StatusMeta.EM_ANDAMENTO) {
            throw new ValidationException("Apenas metas em andamento podem ser pausadas");
        }

        meta.setStatus(StatusMeta.PAUSADA);
        meta = metaRepository.save(meta);

        log.info("Meta pausada com sucesso - ID: {}", id);
        return metaMapper.toDto(meta);
    }

    /**
     * Retoma meta pausada
     */
    @Transactional
    @CacheEvict(value = {"metas", "dashboard"}, allEntries = true)
    public MetaResponseDTO retomar(Long id) {
        log.info("Retomando meta - ID: {}", id);

        Meta meta = metaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(meta.getUsuario().getId());

        // Valida status
        if (meta.getStatus() != StatusMeta.PAUSADA) {
            throw new ValidationException("Apenas metas pausadas podem ser retomadas");
        }

        meta.setStatus(StatusMeta.EM_ANDAMENTO);
        meta = metaRepository.save(meta);

        log.info("Meta retomada com sucesso - ID: {}", id);
        return metaMapper.toDto(meta);
    }

    /**
     * Deleta meta
     */
    @Transactional
    @CacheEvict(value = {"metas", "dashboard"}, allEntries = true)
    public void delete(Long id) {
        log.info("Deletando meta - ID: {}", id);

        Meta meta = metaRepository.findByIdWithTransacoes(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(meta.getUsuario().getId());

        metaRepository.delete(meta);
        log.info("Meta deletada com sucesso - ID: {}", id);
    }

    /**
     * Busca transações de uma meta
     */
    @Transactional(readOnly = true)
    public Page<TransacaoMetaResponseDTO> findTransacoesByMeta(Long metaId, Pageable pageable) {
        log.debug("Buscando transações da meta: {}", metaId);

        // Valida que meta existe e pertence ao usuário
        Meta meta = metaRepository.findById(metaId)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada"));

        securityUtil.validarPermissaoUsuario(meta.getUsuario().getId());

        return transacaoMetaService.findByMeta(metaId, pageable);
    }

    /**
     * Resumo de metas
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getResumo() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Gerando resumo de metas do usuário: {}", usuarioId);

        BigDecimal valorObjetivoTotal = metaRepository.sumValorObjetivoEmAndamento(usuarioId);
        BigDecimal valorAtualTotal = metaRepository.sumValorAtualEmAndamento(usuarioId);
        BigDecimal totalEconomizado = metaRepository.sumTotalEconomizado(usuarioId);
        BigDecimal progressoMedio = metaRepository.calcularProgressoMedio(usuarioId);

        Long countEmAndamento = metaRepository.countByUsuarioIdAndStatus(usuarioId, StatusMeta.EM_ANDAMENTO);
        Long countConcluidas = metaRepository.countByUsuarioIdAndStatus(usuarioId, StatusMeta.CONCLUIDA);
        Long countCanceladas = metaRepository.countByUsuarioIdAndStatus(usuarioId, StatusMeta.CANCELADA);
        Long countPausadas = metaRepository.countByUsuarioIdAndStatus(usuarioId, StatusMeta.PAUSADA);
        Long countVencidas = metaRepository.countVencidasByUsuarioId(usuarioId);

        BigDecimal valorRestante = valorObjetivoTotal.subtract(valorAtualTotal);

        Map<String, Object> resumo = new HashMap<>();
        resumo.put("valorObjetivoTotal", valorObjetivoTotal);
        resumo.put("valorAtualTotal", valorAtualTotal);
        resumo.put("valorRestante", valorRestante);
        resumo.put("totalEconomizado", totalEconomizado);
        resumo.put("progressoMedio", progressoMedio != null ? progressoMedio : BigDecimal.ZERO);
        resumo.put("quantidadeEmAndamento", countEmAndamento);
        resumo.put("quantidadeConcluidas", countConcluidas);
        resumo.put("quantidadeCanceladas", countCanceladas);
        resumo.put("quantidadePausadas", countPausadas);
        resumo.put("quantidadeVencidas", countVencidas);

        log.info("Resumo de metas gerado - Em andamento: {}, Concluídas: {}",
                countEmAndamento, countConcluidas);
        return resumo;
    }

    /**
     * Valida dados da meta
     */
    private void validateMeta(MetaRequestDTO request) {
        if (request.getNome() == null || request.getNome().trim().isEmpty()) {
            throw new ValidationException("Nome é obrigatório");
        }
        if (request.getNome().trim().length() > 100) {
            throw new ValidationException("Nome não pode exceder 100 caracteres");
        }
        if (request.getValorObjetivo() == null || request.getValorObjetivo().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Valor objetivo deve ser positivo");
        }
        if (request.getPrazo() != null && request.getPrazo().isBefore(LocalDate.now())) {
            throw new ValidationException("Prazo não pode ser anterior à data atual");
        }
        if (request.getDescricao() != null && request.getDescricao().length() > 500) {
            throw new ValidationException("Descrição não pode exceder 500 caracteres");
        }
        if (request.getObservacoes() != null && request.getObservacoes().length() > 1000) {
            throw new ValidationException("Observações não podem exceder 1000 caracteres");
        }
    }

    /**
     * Valida período
     */
    private void validatePeriodo(LocalDate inicio, LocalDate fim) {
        if (inicio == null || fim == null) {
            throw new ValidationException("Período inicial e final são obrigatórios");
        }
        if (inicio.isAfter(fim)) {
            throw new ValidationException("Data inicial não pode ser posterior à data final");
        }
    }
}