package com.financeiro.financeiro_pessoal_backend.repository;

import com.financeiro.financeiro_pessoal_backend.model.TransacaoMeta;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoTransacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransacaoMetaRepository extends JpaRepository<TransacaoMeta, Long> {

    /**
     * Busca transações por meta ordenadas por data
     */
    @Query("SELECT t FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "ORDER BY t.data DESC")
    List<TransacaoMeta> findByMetaIdOrderByDataDesc(@Param("metaId") Long metaId);

    /**
     * Busca transações por meta e tipo
     */
    @Query("SELECT t FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "AND t.tipo = :tipo " +
            "ORDER BY t.data DESC")
    List<TransacaoMeta> findByMetaIdAndTipo(
            @Param("metaId") Long metaId,
            @Param("tipo") TipoTransacao tipo
    );

    /**
     * Busca aportes de uma meta
     */
    @Query("SELECT t FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "AND t.tipo = 'APORTE' " +
            "ORDER BY t.data DESC")
    List<TransacaoMeta> findAportesByMetaId(@Param("metaId") Long metaId);

    /**
     * Busca resgates de uma meta
     */
    @Query("SELECT t FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "AND t.tipo = 'RESGATE' " +
            "ORDER BY t.data DESC")
    List<TransacaoMeta> findResgatesByMetaId(@Param("metaId") Long metaId);

    /**
     * Busca transações por período
     */
    @Query("SELECT t FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "AND t.data BETWEEN :inicio AND :fim " +
            "ORDER BY t.data DESC")
    List<TransacaoMeta> findByMetaIdAndDataBetween(
            @Param("metaId") Long metaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    /**
     * Busca transações de todas as metas do usuário
     */
    @Query("SELECT t FROM TransacaoMeta t " +
            "WHERE t.meta.usuario.id = :usuarioId " +
            "ORDER BY t.data DESC")
    List<TransacaoMeta> findByUsuarioIdOrderByDataDesc(@Param("usuarioId") Long usuarioId);

    /**
     * Busca últimas N transações de uma meta
     */
    @Query("SELECT t FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "ORDER BY t.data DESC " +
            "LIMIT :limit")
    List<TransacaoMeta> findTopNByMetaId(
            @Param("metaId") Long metaId,
            @Param("limit") int limit
    );

    /**
     * Soma total de aportes de uma meta
     */
    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "AND t.tipo = 'APORTE'")
    BigDecimal sumAportesByMetaId(@Param("metaId") Long metaId);

    /**
     * Soma total de resgates de uma meta
     */
    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "AND t.tipo = 'RESGATE'")
    BigDecimal sumResgatesByMetaId(@Param("metaId") Long metaId);

    /**
     * Soma total de aportes por período
     */
    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "AND t.tipo = 'APORTE' " +
            "AND t.data BETWEEN :inicio AND :fim")
    BigDecimal sumAportesByMetaIdAndPeriodo(
            @Param("metaId") Long metaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    /**
     * Soma total de resgates por período
     */
    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "AND t.tipo = 'RESGATE' " +
            "AND t.data BETWEEN :inicio AND :fim")
    BigDecimal sumResgatesByMetaIdAndPeriodo(
            @Param("metaId") Long metaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    /**
     * Conta transações por meta
     */
    Long countByMetaId(Long metaId);

    /**
     * Conta aportes de uma meta
     */
    @Query("SELECT COUNT(t) FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "AND t.tipo = 'APORTE'")
    Long countAportesByMetaId(@Param("metaId") Long metaId);

    /**
     * Conta resgates de uma meta
     */
    @Query("SELECT COUNT(t) FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "AND t.tipo = 'RESGATE'")
    Long countResgatesByMetaId(@Param("metaId") Long metaId);

    /**
     * Calcula média de aportes
     */
    @Query("SELECT AVG(t.valor) FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "AND t.tipo = 'APORTE'")
    BigDecimal calcularMediaAportes(@Param("metaId") Long metaId);

    /**
     * Busca maior aporte
     */
    @Query("SELECT MAX(t.valor) FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "AND t.tipo = 'APORTE'")
    BigDecimal findMaiorAporte(@Param("metaId") Long metaId);

    /**
     * Busca menor aporte
     */
    @Query("SELECT MIN(t.valor) FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "AND t.tipo = 'APORTE'")
    BigDecimal findMenorAporte(@Param("metaId") Long metaId);

    /**
     * Agrupa transações por mês
     */
    @Query("SELECT EXTRACT(YEAR FROM t.data) as ano, " +
            "EXTRACT(MONTH FROM t.data) as mes, " +
            "t.tipo as tipo, " +
            "COALESCE(SUM(t.valor), 0) as total " +
            "FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "GROUP BY EXTRACT(YEAR FROM t.data), EXTRACT(MONTH FROM t.data), t.tipo " +
            "ORDER BY ano DESC, mes DESC")
    List<Object[]> groupByMes(@Param("metaId") Long metaId);

    /**
     * Busca transações do mês corrente
     */
    @Query("SELECT t FROM TransacaoMeta t " +
            "WHERE t.meta.id = :metaId " +
            "AND EXTRACT(YEAR FROM t.data) = :ano " +
            "AND EXTRACT(MONTH FROM t.data) = :mes " +
            "ORDER BY t.data DESC")
    List<TransacaoMeta> findByMetaIdAndMes(
            @Param("metaId") Long metaId,
            @Param("ano") int ano,
            @Param("mes") int mes
    );
}