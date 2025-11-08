package com.financeiro.financeiro_pessoal_backend.repository;

import com.financeiro.financeiro_pessoal_backend.model.Parametro;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoParametro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParametroRepository extends JpaRepository<Parametro, Long> {

    /**
     * Busca parâmetros por usuário ordenados por chave
     */
    @Query("SELECT p FROM Parametro p " +
            "WHERE p.usuario.id = :usuarioId " +
            "ORDER BY p.chave ASC")
    List<Parametro> findByUsuarioIdOrderByChaveAsc(@Param("usuarioId") Long usuarioId);

    /**
     * Busca parâmetro por usuário e chave
     */
    @Query("SELECT p FROM Parametro p " +
            "WHERE p.usuario.id = :usuarioId " +
            "AND p.chave = :chave")
    Optional<Parametro> findByUsuarioIdAndChave(
            @Param("usuarioId") Long usuarioId,
            @Param("chave") String chave
    );

    /**
     * Verifica se existe parâmetro com a chave para o usuário
     */
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Parametro p " +
            "WHERE p.usuario.id = :usuarioId " +
            "AND p.chave = :chave")
    boolean existsByUsuarioIdAndChave(
            @Param("usuarioId") Long usuarioId,
            @Param("chave") String chave
    );

    /**
     * Busca parâmetros por tipo
     */
    @Query("SELECT p FROM Parametro p " +
            "WHERE p.usuario.id = :usuarioId " +
            "AND p.tipo = :tipo " +
            "ORDER BY p.chave ASC")
    List<Parametro> findByUsuarioIdAndTipo(
            @Param("usuarioId") Long usuarioId,
            @Param("tipo") TipoParametro tipo
    );

    /**
     * Busca valor de um parâmetro específico
     */
    @Query("SELECT p.valor FROM Parametro p " +
            "WHERE p.usuario.id = :usuarioId " +
            "AND p.chave = :chave")
    Optional<String> findValorByUsuarioIdAndChave(
            @Param("usuarioId") Long usuarioId,
            @Param("chave") String chave
    );

    /**
     * Busca parâmetros por chave (busca parcial)
     */
    @Query("SELECT p FROM Parametro p " +
            "WHERE p.usuario.id = :usuarioId " +
            "AND LOWER(p.chave) LIKE LOWER(CONCAT('%', :chave, '%')) " +
            "ORDER BY p.chave ASC")
    List<Parametro> findByUsuarioIdAndChaveContaining(
            @Param("usuarioId") Long usuarioId,
            @Param("chave") String chave
    );

    /**
     * Busca parâmetros do tipo STRING
     */
    @Query("SELECT p FROM Parametro p " +
            "WHERE p.usuario.id = :usuarioId " +
            "AND p.tipo = 'STRING' " +
            "ORDER BY p.chave ASC")
    List<Parametro> findStringParametrosByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Busca parâmetros do tipo NUMBER
     */
    @Query("SELECT p FROM Parametro p " +
            "WHERE p.usuario.id = :usuarioId " +
            "AND p.tipo = 'NUMBER' " +
            "ORDER BY p.chave ASC")
    List<Parametro> findNumberParametrosByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Busca parâmetros do tipo BOOLEAN
     */
    @Query("SELECT p FROM Parametro p " +
            "WHERE p.usuario.id = :usuarioId " +
            "AND p.tipo = 'BOOLEAN' " +
            "ORDER BY p.chave ASC")
    List<Parametro> findBooleanParametrosByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Conta total de parâmetros do usuário
     */
    Long countByUsuarioId(Long usuarioId);

    /**
     * Conta parâmetros por tipo
     */
    @Query("SELECT COUNT(p) FROM Parametro p " +
            "WHERE p.usuario.id = :usuarioId " +
            "AND p.tipo = :tipo")
    Long countByUsuarioIdAndTipo(
            @Param("usuarioId") Long usuarioId,
            @Param("tipo") TipoParametro tipo
    );

    /**
     * Busca todos os parâmetros com descrição
     */
    @Query("SELECT p FROM Parametro p " +
            "WHERE p.usuario.id = :usuarioId " +
            "AND p.descricao IS NOT NULL " +
            "ORDER BY p.chave ASC")
    List<Parametro> findByUsuarioIdWithDescricao(@Param("usuarioId") Long usuarioId);

    /**
     * Agrupa parâmetros por tipo com contagem
     */
    @Query("SELECT p.tipo as tipo, COUNT(p) as quantidade " +
            "FROM Parametro p " +
            "WHERE p.usuario.id = :usuarioId " +
            "GROUP BY p.tipo")
    List<Object[]> groupByTipo(@Param("usuarioId") Long usuarioId);

    /**
     * Deleta parâmetro por usuário e chave
     */
    @Query("DELETE FROM Parametro p " +
            "WHERE p.usuario.id = :usuarioId " +
            "AND p.chave = :chave")
    void deleteByUsuarioIdAndChave(
            @Param("usuarioId") Long usuarioId,
            @Param("chave") String chave
    );

    /**
     * Busca parâmetros criados/atualizados recentemente
     */
    @Query("SELECT p FROM Parametro p " +
            "WHERE p.usuario.id = :usuarioId " +
            "ORDER BY p.updatedAt DESC")
    List<Parametro> findByUsuarioIdOrderByUpdatedAtDesc(@Param("usuarioId") Long usuarioId);
}