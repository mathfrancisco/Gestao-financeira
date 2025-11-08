package com.financeiro.financeiro_pessoal_backend.repository;

import com.financeiro.financeiro_pessoal_backend.model.Categoria;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoCategoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    /**
     * Busca categorias por usuário ordenadas por nome
     */
    @Query("SELECT c FROM Categoria c " +
            "WHERE c.usuario.id = :usuarioId " +
            "ORDER BY c.nome ASC")
    List<Categoria> findByUsuarioIdOrderByNomeAsc(@Param("usuarioId") Long usuarioId);

    /**
     * Busca categoria por ID com despesas (evita N+1)
     */
    @Query("SELECT c FROM Categoria c " +
            "LEFT JOIN FETCH c.despesas d " +
            "WHERE c.id = :id")
    Optional<Categoria> findByIdWithDespesas(@Param("id") Long id);

    /**
     * Busca categorias ativas do usuário
     */
    @Query("SELECT c FROM Categoria c " +
            "WHERE c.usuario.id = :usuarioId " +
            "AND c.ativa = true " +
            "ORDER BY c.nome ASC")
    List<Categoria> findAtivasByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Busca categorias por tipo
     */
    @Query("SELECT c FROM Categoria c " +
            "WHERE c.usuario.id = :usuarioId " +
            "AND c.tipo = :tipo " +
            "ORDER BY c.nome ASC")
    List<Categoria> findByUsuarioIdAndTipo(
            @Param("usuarioId") Long usuarioId,
            @Param("tipo") TipoCategoria tipo
    );

    /**
     * Busca categorias ativas por tipo
     */
    @Query("SELECT c FROM Categoria c " +
            "WHERE c.usuario.id = :usuarioId " +
            "AND c.tipo = :tipo " +
            "AND c.ativa = true " +
            "ORDER BY c.nome ASC")
    List<Categoria> findAtivasByUsuarioIdAndTipo(
            @Param("usuarioId") Long usuarioId,
            @Param("tipo") TipoCategoria tipo
    );

    /**
     * Busca categoria por usuário e nome
     */
    @Query("SELECT c FROM Categoria c " +
            "WHERE c.usuario.id = :usuarioId " +
            "AND LOWER(c.nome) = LOWER(:nome)")
    Optional<Categoria> findByUsuarioIdAndNome(
            @Param("usuarioId") Long usuarioId,
            @Param("nome") String nome
    );

    /**
     * Verifica se existe categoria com o nome para o usuário
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Categoria c " +
            "WHERE c.usuario.id = :usuarioId " +
            "AND LOWER(c.nome) = LOWER(:nome)")
    boolean existsByUsuarioIdAndNome(
            @Param("usuarioId") Long usuarioId,
            @Param("nome") String nome
    );

    /**
     * Verifica se existe categoria com o nome (excluindo uma categoria específica)
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Categoria c " +
            "WHERE c.usuario.id = :usuarioId " +
            "AND LOWER(c.nome) = LOWER(:nome) " +
            "AND c.id != :categoriaId")
    boolean existsByUsuarioIdAndNomeAndIdNot(
            @Param("usuarioId") Long usuarioId,
            @Param("nome") String nome,
            @Param("categoriaId") Long categoriaId
    );

    /**
     * Busca categorias de despesa ativas
     */
    @Query("SELECT c FROM Categoria c " +
            "WHERE c.usuario.id = :usuarioId " +
            "AND c.tipo = 'DESPESA' " +
            "AND c.ativa = true " +
            "ORDER BY c.nome ASC")
    List<Categoria> findCategoriasDespesaAtivas(@Param("usuarioId") Long usuarioId);

    /**
     * Busca categorias de receita ativas
     */
    @Query("SELECT c FROM Categoria c " +
            "WHERE c.usuario.id = :usuarioId " +
            "AND c.tipo = 'RECEITA' " +
            "AND c.ativa = true " +
            "ORDER BY c.nome ASC")
    List<Categoria> findCategoriasReceitaAtivas(@Param("usuarioId") Long usuarioId);

    /**
     * Busca categorias com despesas associadas
     */
    @Query("SELECT DISTINCT c FROM Categoria c " +
            "INNER JOIN c.despesas d " +
            "WHERE c.usuario.id = :usuarioId " +
            "ORDER BY c.nome ASC")
    List<Categoria> findCategoriasComDespesas(@Param("usuarioId") Long usuarioId);

    /**
     * Busca categorias sem despesas associadas
     */
    @Query("SELECT c FROM Categoria c " +
            "WHERE c.usuario.id = :usuarioId " +
            "AND NOT EXISTS (SELECT 1 FROM Despesa d WHERE d.categoria = c) " +
            "ORDER BY c.nome ASC")
    List<Categoria> findCategoriasSemDespesas(@Param("usuarioId") Long usuarioId);

    /**
     * Conta total de categorias do usuário
     */
    Long countByUsuarioId(Long usuarioId);

    /**
     * Conta categorias ativas do usuário
     */
    @Query("SELECT COUNT(c) FROM Categoria c " +
            "WHERE c.usuario.id = :usuarioId " +
            "AND c.ativa = true")
    Long countAtivasByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Conta categorias por tipo
     */
    @Query("SELECT COUNT(c) FROM Categoria c " +
            "WHERE c.usuario.id = :usuarioId " +
            "AND c.tipo = :tipo")
    Long countByUsuarioIdAndTipo(
            @Param("usuarioId") Long usuarioId,
            @Param("tipo") TipoCategoria tipo
    );

    /**
     * Conta despesas por categoria
     */
    @Query("SELECT COUNT(d) FROM Despesa d " +
            "WHERE d.categoria.id = :categoriaId")
    Long countDespesasByCategoriaId(@Param("categoriaId") Long categoriaId);

    /**
     * Busca categorias mais usadas (com mais despesas)
     */
    @Query("SELECT c FROM Categoria c " +
            "LEFT JOIN c.despesas d " +
            "WHERE c.usuario.id = :usuarioId " +
            "GROUP BY c.id " +
            "ORDER BY COUNT(d) DESC")
    List<Categoria> findMaisUsadasByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Busca categorias por nome (busca parcial, case insensitive)
     */
    @Query("SELECT c FROM Categoria c " +
            "WHERE c.usuario.id = :usuarioId " +
            "AND LOWER(c.nome) LIKE LOWER(CONCAT('%', :nome, '%')) " +
            "ORDER BY c.nome ASC")
    List<Categoria> findByUsuarioIdAndNomeContaining(
            @Param("usuarioId") Long usuarioId,
            @Param("nome") String nome
    );

    /**
     * Agrupa categorias por tipo com contagem
     */
    @Query("SELECT c.tipo as tipo, COUNT(c) as quantidade " +
            "FROM Categoria c " +
            "WHERE c.usuario.id = :usuarioId " +
            "GROUP BY c.tipo")
    List<Object[]> groupByTipo(@Param("usuarioId") Long usuarioId);
}