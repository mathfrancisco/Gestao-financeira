package com.financeiro.financeiro_pessoal_backend.repository;

import com.financeiro.financeiro_pessoal_backend.model.Meta;
import com.financeiro.financeiro_pessoal_backend.model.enums.StatusMeta;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoMeta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetaRepository extends JpaRepository<Meta, Long> {

    /**
     * Busca metas por usuário ordenadas por data de criação
     */
    @Query("SELECT m FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "ORDER BY m.createdAt DESC")
    List<Meta> findByUsuarioIdOrderByCreatedAtDesc(@Param("usuarioId") Long usuarioId);

    /**
     * Busca meta por ID com transações (evita N+1)
     */
    @Query("SELECT m FROM Meta m " +
            "LEFT JOIN FETCH m.transacoes t " +
            "WHERE m.id = :id " +
            "ORDER BY t.data DESC")
    Optional<Meta> findByIdWithTransacoes(@Param("id") Long id);

    /**
     * Busca metas do usuário com transações (evita N+1)
     */
    @Query("SELECT DISTINCT m FROM Meta m " +
            "LEFT JOIN FETCH m.transacoes t " +
            "WHERE m.usuario.id = :usuarioId " +
            "ORDER BY m.createdAt DESC")
    List<Meta> findByUsuarioIdWithTransacoes(@Param("usuarioId") Long usuarioId);

    /**
     * Busca metas por status
     */
    @Query("SELECT m FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND m.status = :status " +
            "ORDER BY m.createdAt DESC")
    List<Meta> findByUsuarioIdAndStatus(
            @Param("usuarioId") Long usuarioId,
            @Param("status") StatusMeta status
    );

    /**
     * Busca metas em andamento
     */
    @Query("SELECT m FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND m.status = 'EM_ANDAMENTO' " +
            "ORDER BY m.progresso DESC")
    List<Meta> findEmAndamentoByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Busca metas concluídas
     */
    @Query("SELECT m FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND m.status = 'CONCLUIDA' " +
            "ORDER BY m.updatedAt DESC")
    List<Meta> findConcluidasByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Busca metas por tipo
     */
    @Query("SELECT m FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND m.tipo = :tipo " +
            "ORDER BY m.createdAt DESC")
    List<Meta> findByUsuarioIdAndTipo(
            @Param("usuarioId") Long usuarioId,
            @Param("tipo") TipoMeta tipo
    );

    /**
     * Busca metas vencidas (prazo expirado e não concluídas)
     */
    @Query("SELECT m FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND m.prazo < CURRENT_DATE " +
            "AND m.status = 'EM_ANDAMENTO' " +
            "AND m.valorAtual < m.valorObjetivo " +
            "ORDER BY m.prazo ASC")
    List<Meta> findVencidasByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Busca metas próximas do vencimento (próximos 30 dias)
     */
    @Query("SELECT m FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND m.prazo BETWEEN CURRENT_DATE AND :dataLimite " +
            "AND m.status = 'EM_ANDAMENTO' " +
            "ORDER BY m.prazo ASC")
    List<Meta> findProximasVencimentoByUsuarioId(
            @Param("usuarioId") Long usuarioId,
            @Param("dataLimite") LocalDate dataLimite
    );

    /**
     * Busca metas por período de prazo
     */
    @Query("SELECT m FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND m.prazo BETWEEN :inicio AND :fim " +
            "ORDER BY m.prazo ASC")
    List<Meta> findByUsuarioIdAndPrazoBetween(
            @Param("usuarioId") Long usuarioId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    /**
     * Soma total de valor objetivo das metas em andamento
     */
    @Query("SELECT COALESCE(SUM(m.valorObjetivo), 0) FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND m.status = 'EM_ANDAMENTO'")
    BigDecimal sumValorObjetivoEmAndamento(@Param("usuarioId") Long usuarioId);

    /**
     * Soma total de valor atual das metas em andamento
     */
    @Query("SELECT COALESCE(SUM(m.valorAtual), 0) FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND m.status = 'EM_ANDAMENTO'")
    BigDecimal sumValorAtualEmAndamento(@Param("usuarioId") Long usuarioId);

    /**
     * Soma total economizado (metas concluídas)
     */
    @Query("SELECT COALESCE(SUM(m.valorAtual), 0) FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND m.status = 'CONCLUIDA'")
    BigDecimal sumTotalEconomizado(@Param("usuarioId") Long usuarioId);

    /**
     * Calcula progresso médio das metas em andamento
     */
    @Query("SELECT AVG(m.progresso) FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND m.status = 'EM_ANDAMENTO'")
    BigDecimal calcularProgressoMedio(@Param("usuarioId") Long usuarioId);

    /**
     * Conta metas por status
     */
    @Query("SELECT COUNT(m) FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND m.status = :status")
    Long countByUsuarioIdAndStatus(
            @Param("usuarioId") Long usuarioId,
            @Param("status") StatusMeta status
    );

    /**
     * Conta metas vencidas
     */
    @Query("SELECT COUNT(m) FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND m.prazo < CURRENT_DATE " +
            "AND m.status = 'EM_ANDAMENTO' " +
            "AND m.valorAtual < m.valorObjetivo")
    Long countVencidasByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Busca metas por nome (case insensitive)
     */
    @Query("SELECT m FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND LOWER(m.nome) LIKE LOWER(CONCAT('%', :nome, '%')) " +
            "ORDER BY m.createdAt DESC")
    List<Meta> findByUsuarioIdAndNomeContaining(
            @Param("usuarioId") Long usuarioId,
            @Param("nome") String nome
    );

    /**
     * Busca metas do mês corrente
     */
    @Query("SELECT m FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND EXTRACT(YEAR FROM m.createdAt) = :ano " +
            "AND EXTRACT(MONTH FROM m.createdAt) = :mes " +
            "ORDER BY m.createdAt DESC")
    List<Meta> findByUsuarioIdAndMes(
            @Param("usuarioId") Long usuarioId,
            @Param("ano") int ano,
            @Param("mes") int mes
    );

    /**
     * Agrupa metas por tipo
     */
    @Query("SELECT m.tipo as tipo, COUNT(m) as quantidade, " +
            "COALESCE(SUM(m.valorObjetivo), 0) as valorTotal " +
            "FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "GROUP BY m.tipo")
    List<Object[]> groupByTipo(@Param("usuarioId") Long usuarioId);

    /**
     * Busca metas com progresso acima de X%
     */
    @Query("SELECT m FROM Meta m " +
            "WHERE m.usuario.id = :usuarioId " +
            "AND m.progresso >= :progressoMinimo " +
            "AND m.status = 'EM_ANDAMENTO' " +
            "ORDER BY m.progresso DESC")
    List<Meta> findByProgressoAcimaDeByUsuarioId(
            @Param("usuarioId") Long usuarioId,
            @Param("progressoMinimo") BigDecimal progressoMinimo
    );

    /**
     * Conta total de metas do usuário
     */
    Long countByUsuarioId(Long usuarioId);
}