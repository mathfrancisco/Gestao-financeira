package com.financeiro.financeiro_pessoal_backend.service;

import com.financeiro.financeiro_pessoal_backend.dto.request.DespesaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.DespesaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.exception.ResourceNotFoundException;
import com.financeiro.financeiro_pessoal_backend.exception.ValidationException;
import com.financeiro.financeiro_pessoal_backend.mapper.DespesaMapper;
import com.financeiro.financeiro_pessoal_backend.model.Categoria;
import com.financeiro.financeiro_pessoal_backend.model.Despesa;
import com.financeiro.financeiro_pessoal_backend.model.Receita;
import com.financeiro.financeiro_pessoal_backend.model.Usuario;
import com.financeiro.financeiro_pessoal_backend.model.enums.StatusPagamento;
import com.financeiro.financeiro_pessoal_backend.repository.CategoriaRepository;
import com.financeiro.financeiro_pessoal_backend.repository.DespesaRepository;
import com.financeiro.financeiro_pessoal_backend.repository.ReceitaRepository;
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
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DespesaService {

    private final DespesaRepository despesaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final ReceitaRepository receitaRepository;
    private final DespesaMapper despesaMapper;
    private final SecurityUtil securityUtil;

    /**
     * Cria uma nova despesa
     */
    @Transactional
    @CacheEvict(value = {"despesas", "receitas", "dashboard"}, allEntries = true)
    public DespesaResponseDTO create(DespesaRequestDTO request) {
        log.info("Criando nova despesa: {}", request.getDescricao());

        Long usuarioId = securityUtil.getUsuarioLogadoId();

        // Busca usuário
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        // Validações
        validateDespesa(request);

        // Busca categoria (opcional)
        Categoria categoria = null;
        if (request.getCategoriaId() != null) {
            categoria = categoriaRepository.findById(request.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

            // Valida se categoria pertence ao usuário
            if (!categoria.getUsuario().getId().equals(usuarioId)) {
                throw new ValidationException("Categoria não pertence ao usuário");
            }

            // Valida se categoria está ativa
            if (!categoria.getAtiva()) {
                throw new ValidationException("Categoria está desativada");
            }
        }

        // Busca receita (opcional)
        Receita receita = null;
        if (request.getReceitaId() != null) {
            receita = receitaRepository.findById(request.getReceitaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Receita não encontrada"));

            // Valida se receita pertence ao usuário
            if (!receita.getUsuario().getId().equals(usuarioId)) {
                throw new ValidationException("Receita não pertence ao usuário");
            }
        }

        // Calcula fim do pagamento se parcelado
        LocalDate fimPagamento = null;
        if (request.getParcelaTotal() != null && request.getParcelaTotal() > 1) {
            fimPagamento = request.getData().plusMonths(request.getParcelaTotal() - 1);
        }

        // Cria despesa
        Despesa despesa = Despesa.builder()
                .usuario(usuario)
                .receita(receita)
                .categoria(categoria)
                .data(request.getData())
                .descricao(request.getDescricao())
                .valor(request.getValor())
                .status(request.getStatus() != null ? request.getStatus() : StatusPagamento.PENDENTE)
                .parcelaAtual(request.getParcelaAtual() != null ? request.getParcelaAtual() : 1)
                .parcelaTotal(request.getParcelaTotal() != null ? request.getParcelaTotal() : 1)
                .fimPagamento(fimPagamento)
                .observacoes(request.getObservacoes())
                .build();

        despesa = despesaRepository.save(despesa);
        log.info("Despesa criada com sucesso - ID: {}, Valor: {}, Parcelado: {}",
                despesa.getId(), despesa.getValor(), despesa.isParcelado());

        return despesaMapper.toDto(despesa);
    }

    /**
     * Busca despesa por ID
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "despesas", key = "#id")
    public DespesaResponseDTO findById(Long id) {
        log.debug("Buscando despesa por ID: {}", id);

        Despesa despesa = despesaRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Despesa não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(despesa.getUsuario().getId());

        return despesaMapper.toDto(despesa);
    }

    /**
     * Lista todas as despesas do usuário com paginação
     */
    @Transactional(readOnly = true)
    public Page<DespesaResponseDTO> findAllByUsuario(Pageable pageable) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Listando despesas do usuário {} - Página: {}", usuarioId, pageable.getPageNumber());

        List<Despesa> despesas = despesaRepository.findByUsuarioIdWithRelations(usuarioId);

        // Aplica paginação
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), despesas.size());
        List<Despesa> pageContent = despesas.subList(start, end);

        List<DespesaResponseDTO> dtos = pageContent.stream()
                .map(despesaMapper::toDto)
                .collect(Collectors.toList());

        log.info("Total de despesas encontradas: {}", despesas.size());
        return new PageImpl<>(dtos, pageable, despesas.size());
    }

    /**
     * Busca despesas por período
     */
    @Transactional(readOnly = true)
    public Page<DespesaResponseDTO> findByPeriodo(LocalDate inicio, LocalDate fim, Pageable pageable) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando despesas do período: {} a {}", inicio, fim);

        validatePeriodo(inicio, fim);

        List<Despesa> despesas = despesaRepository.findByUsuarioIdAndDataBetweenWithRelations(
                usuarioId, inicio, fim);

        // Aplica paginação
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), despesas.size());
        List<Despesa> pageContent = despesas.subList(start, end);

        List<DespesaResponseDTO> dtos = pageContent.stream()
                .map(despesaMapper::toDto)
                .collect(Collectors.toList());

        log.info("Despesas encontradas no período: {}", despesas.size());
        return new PageImpl<>(dtos, pageable, despesas.size());
    }

    /**
     * Busca despesas por status
     */
    @Transactional(readOnly = true)
    public List<DespesaResponseDTO> findByStatus(StatusPagamento status) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando despesas com status: {}", status);

        List<Despesa> despesas = despesaRepository.findByUsuarioIdAndStatus(usuarioId, status);
        log.info("Despesas encontradas com status {}: {}", status, despesas.size());

        return despesas.stream()
                .map(despesaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca despesas vencidas
     */
    @Transactional(readOnly = true)
    public List<DespesaResponseDTO> findVencidas() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando despesas vencidas do usuário: {}", usuarioId);

        List<Despesa> despesas = despesaRepository.findVencidasByUsuarioId(usuarioId);
        log.warn("Total de despesas vencidas: {}", despesas.size());

        return despesas.stream()
                .map(despesaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca despesas por categoria
     */
    @Transactional(readOnly = true)
    public Page<DespesaResponseDTO> findByCategoria(Long categoriaId, Pageable pageable) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando despesas da categoria: {}", categoriaId);

        // Valida categoria
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        if (!categoria.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("Categoria não pertence ao usuário");
        }

        List<Despesa> despesas = despesaRepository.findByUsuarioIdAndCategoriaId(usuarioId, categoriaId);

        // Aplica paginação
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), despesas.size());
        List<Despesa> pageContent = despesas.subList(start, end);

        List<DespesaResponseDTO> dtos = pageContent.stream()
                .map(despesaMapper::toDto)
                .collect(Collectors.toList());

        log.info("Despesas encontradas na categoria: {}", despesas.size());
        return new PageImpl<>(dtos, pageable, despesas.size());
    }

    /**
     * Busca despesas por receita
     */
    @Transactional(readOnly = true)
    public List<DespesaResponseDTO> findByReceita(Long receitaId) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando despesas da receita: {}", receitaId);

        // Valida receita
        Receita receita = receitaRepository.findById(receitaId)
                .orElseThrow(() -> new ResourceNotFoundException("Receita não encontrada"));

        if (!receita.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("Receita não pertence ao usuário");
        }

        List<Despesa> despesas = despesaRepository.findByReceitaId(receitaId);
        log.info("Despesas encontradas na receita: {}", despesas.size());

        return despesas.stream()
                .map(despesaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca despesas parceladas
     */
    @Transactional(readOnly = true)
    public List<DespesaResponseDTO> findParceladas() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando despesas parceladas do usuário: {}", usuarioId);

        List<Despesa> despesas = despesaRepository.findParceladasByUsuarioId(usuarioId);
        log.info("Total de despesas parceladas: {}", despesas.size());

        return despesas.stream()
                .map(despesaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca despesas do mês
     */
    @Transactional(readOnly = true)
    public List<DespesaResponseDTO> findByMes(int ano, int mes) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando despesas do mês {}/{}", mes, ano);

        validateAnoMes(ano, mes);

        List<Despesa> despesas = despesaRepository.findByUsuarioIdAndMes(usuarioId, ano, mes);
        log.info("Despesas encontradas no mês {}/{}: {}", mes, ano, despesas.size());

        return despesas.stream()
                .map(despesaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza despesa
     */
    @Transactional
    @CacheEvict(value = {"despesas", "receitas", "dashboard"}, allEntries = true)
    public DespesaResponseDTO update(Long id, DespesaRequestDTO request) {
        log.info("Atualizando despesa - ID: {}", id);

        Despesa despesa = despesaRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Despesa não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(despesa.getUsuario().getId());

        // Validações
        validateDespesa(request);

        // Atualiza categoria
        if (request.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

            if (!categoria.getUsuario().getId().equals(despesa.getUsuario().getId())) {
                throw new ValidationException("Categoria não pertence ao usuário");
            }
            if (!categoria.getAtiva()) {
                throw new ValidationException("Categoria está desativada");
            }
            despesa.setCategoria(categoria);
        } else {
            despesa.setCategoria(null);
        }

        // Atualiza receita
        if (request.getReceitaId() != null) {
            Receita receita = receitaRepository.findById(request.getReceitaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Receita não encontrada"));

            if (!receita.getUsuario().getId().equals(despesa.getUsuario().getId())) {
                throw new ValidationException("Receita não pertence ao usuário");
            }
            despesa.setReceita(receita);
        } else {
            despesa.setReceita(null);
        }

        // Atualiza dados
        despesa.setData(request.getData());
        despesa.setDescricao(request.getDescricao());
        despesa.setValor(request.getValor());
        despesa.setStatus(request.getStatus() != null ? request.getStatus() : StatusPagamento.PENDENTE);
        despesa.setParcelaAtual(request.getParcelaAtual() != null ? request.getParcelaAtual() : 1);
        despesa.setParcelaTotal(request.getParcelaTotal() != null ? request.getParcelaTotal() : 1);
        despesa.setObservacoes(request.getObservacoes());

        // Recalcula fim do pagamento
        if (despesa.getParcelaTotal() > 1) {
            despesa.setFimPagamento(despesa.getData().plusMonths(despesa.getParcelaTotal() - 1));
        } else {
            despesa.setFimPagamento(null);
        }

        despesa = despesaRepository.save(despesa);
        log.info("Despesa atualizada com sucesso - ID: {}", despesa.getId());

        return despesaMapper.toDto(despesa);
    }

    /**
     * Marca despesa como paga
     */
    @Transactional
    @CacheEvict(value = {"despesas", "dashboard"}, allEntries = true)
    public DespesaResponseDTO marcarComoPaga(Long id) {
        log.info("Marcando despesa como paga - ID: {}", id);

        Despesa despesa = despesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Despesa não encontrada com ID: " + id));

        securityUtil.validarPermissaoUsuario(despesa.getUsuario().getId());

        despesa.setStatus(StatusPagamento.PAGO);
        despesa = despesaRepository.save(despesa);

        log.info("Despesa marcada como paga - ID: {}", id);
        return despesaMapper.toDto(despesa);
    }

    /**
     * Marca despesa como pendente
     */
    @Transactional
    @CacheEvict(value = {"despesas", "dashboard"}, allEntries = true)
    public DespesaResponseDTO marcarComoPendente(Long id) {
        log.info("Marcando despesa como pendente - ID: {}", id);

        Despesa despesa = despesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Despesa não encontrada com ID: " + id));

        securityUtil.validarPermissaoUsuario(despesa.getUsuario().getId());

        despesa.setStatus(StatusPagamento.PENDENTE);
        despesa = despesaRepository.save(despesa);

        log.info("Despesa marcada como pendente - ID: {}", id);
        return despesaMapper.toDto(despesa);
    }

    /**
     * Deleta despesa
     */
    @Transactional
    @CacheEvict(value = {"despesas", "receitas", "dashboard"}, allEntries = true)
    public void delete(Long id) {
        log.info("Deletando despesa - ID: {}", id);

        Despesa despesa = despesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Despesa não encontrada com ID: " + id));

        securityUtil.validarPermissaoUsuario(despesa.getUsuario().getId());

        despesaRepository.delete(despesa);
        log.info("Despesa deletada com sucesso - ID: {}", id);
    }

    /**
     * Calcula total de despesas por período
     */
    @Transactional(readOnly = true)
    public BigDecimal calcularTotalPorPeriodo(LocalDate inicio, LocalDate fim) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Calculando total de despesas do período: {} a {}", inicio, fim);

        validatePeriodo(inicio, fim);

        BigDecimal total = despesaRepository.sumTotalByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
        log.info("Total de despesas no período: {}", total);

        return total;
    }

    /**
     * Calcula total de despesas pagas por período
     */
    @Transactional(readOnly = true)
    public BigDecimal calcularTotalPagoPorPeriodo(LocalDate inicio, LocalDate fim) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();

        validatePeriodo(inicio, fim);

        BigDecimal total = despesaRepository.sumTotalPagoByPeriodo(usuarioId, inicio, fim);
        log.info("Total de despesas pagas no período: {}", total);

        return total;
    }

    /**
     * Calcula total de despesas pendentes por período
     */
    @Transactional(readOnly = true)
    public BigDecimal calcularTotalPendentePorPeriodo(LocalDate inicio, LocalDate fim) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();

        validatePeriodo(inicio, fim);

        BigDecimal total = despesaRepository.sumTotalPendenteByPeriodo(usuarioId, inicio, fim);
        log.info("Total de despesas pendentes no período: {}", total);

        return total;
    }

    /**
     * Agrupa despesas por categoria em um período
     */
    @Transactional(readOnly = true)
    public Map<String, BigDecimal> agruparPorCategoria(LocalDate inicio, LocalDate fim) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Agrupando despesas por categoria - Período: {} a {}", inicio, fim);

        validatePeriodo(inicio, fim);

        List<Object[]> results = despesaRepository.sumByCategoria(usuarioId, inicio, fim);

        Map<String, BigDecimal> grouped = new HashMap<>();
        for (Object[] result : results) {
            String categoria = (String) result[0];
            BigDecimal total = (BigDecimal) result[1];
            grouped.put(categoria != null ? categoria : "Sem categoria", total);
        }

        log.info("Despesas agrupadas em {} categorias", grouped.size());
        return grouped;
    }

    /**
     * Conta despesas por status
     */
    @Transactional(readOnly = true)
    public Long countByStatus(StatusPagamento status) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        Long count = despesaRepository.countByUsuarioIdAndStatus(usuarioId, status);
        log.debug("Total de despesas com status {}: {}", status, count);
        return count;
    }

    /**
     * Calcula média mensal de despesas
     */
    @Transactional(readOnly = true)
    public BigDecimal calcularMediaMensal() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        BigDecimal media = despesaRepository.calcularMediaMensalByUsuarioId(usuarioId);
        log.info("Média mensal de despesas: {}", media);
        return media != null ? media : BigDecimal.ZERO;
    }

    /**
     * Resumo mensal de despesas
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getResumoMensal(int ano, int mes) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Gerando resumo mensal: {}/{}", mes, ano);

        validateAnoMes(ano, mes);

        YearMonth yearMonth = YearMonth.of(ano, mes);
        LocalDate inicio = yearMonth.atDay(1);
        LocalDate fim = yearMonth.atEndOfMonth();

        BigDecimal totalGeral = despesaRepository.sumTotalByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
        BigDecimal totalPago = despesaRepository.sumTotalPagoByPeriodo(usuarioId, inicio, fim);
        BigDecimal totalPendente = despesaRepository.sumTotalPendenteByPeriodo(usuarioId, inicio, fim);
        Long countPago = despesaRepository.countByUsuarioIdAndStatus(usuarioId, StatusPagamento.PAGO);
        Long countPendente = despesaRepository.countByUsuarioIdAndStatus(usuarioId, StatusPagamento.PENDENTE);

        Map<String, Object> resumo = new HashMap<>();
        resumo.put("mes", mes);
        resumo.put("ano", ano);
        resumo.put("totalGeral", totalGeral);
        resumo.put("totalPago", totalPago);
        resumo.put("totalPendente", totalPendente);
        resumo.put("quantidadePaga", countPago);
        resumo.put("quantidadePendente", countPendente);
        resumo.put("porCategoria", agruparPorCategoria(inicio, fim));

        log.info("Resumo mensal gerado: Total={}", totalGeral);
        return resumo;
    }

    /**
     * Valida dados da despesa
     */
    private void validateDespesa(DespesaRequestDTO request) {
        if (request.getData() == null) {
            throw new ValidationException("Data é obrigatória");
        }
        if (request.getDescricao() == null || request.getDescricao().trim().isEmpty()) {
            throw new ValidationException("Descrição é obrigatória");
        }
        if (request.getValor() == null || request.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Valor deve ser positivo");
        }
        if (request.getParcelaAtual() != null && request.getParcelaAtual() < 1) {
            throw new ValidationException("Parcela atual deve ser maior que zero");
        }
        if (request.getParcelaTotal() != null && request.getParcelaTotal() < 1) {
            throw new ValidationException("Parcela total deve ser maior que zero");
        }
        if (request.getParcelaAtual() != null && request.getParcelaTotal() != null &&
                request.getParcelaAtual() > request.getParcelaTotal()) {
            throw new ValidationException("Parcela atual não pode ser maior que o total");
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

    /**
     * Valida ano e mês
     */
    private void validateAnoMes(int ano, int mes) {
        if (ano < 1900 || ano > 2100) {
            throw new ValidationException("Ano inválido");
        }
        if (mes < 1 || mes > 12) {
            throw new ValidationException("Mês inválido");
        }
    }
}