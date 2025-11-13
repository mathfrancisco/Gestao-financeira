import api from './api';
import type {
    Categoria,
    CategoriaRequestDTO,
    TipoCategoria,
    CategoriaResumo,
} from '../types/categoria';

export const categoriaService = {
    /**
     * Criar nova categoria
     */
    async create(data: CategoriaRequestDTO): Promise<Categoria> {
        const response = await api.post<Categoria>('/categorias', data);
        return response.data;
    },

    /**
     * Buscar categoria por ID
     */
    async findById(id: number): Promise<Categoria> {
        const response = await api.get<Categoria>(`/categorias/${id}`);
        return response.data;
    },

    /**
     * Buscar categoria por ID com despesas
     */
    async findByIdWithDespesas(id: number): Promise<Categoria> {
        const response = await api.get<Categoria>(`/categorias/${id}/despesas`);
        return response.data;
    },

    /**
     * Listar todas as categorias do usuário
     */
    async findAll(): Promise<Categoria[]> {
        const response = await api.get<Categoria[]>('/categorias');
        return response.data;
    },

    /**
     * Listar categorias ativas
     */
    async findAtivas(): Promise<Categoria[]> {
        const response = await api.get<Categoria[]>('/categorias/ativas');
        return response.data;
    },

    /**
     * Buscar categorias por tipo
     */
    async findByTipo(tipo: TipoCategoria): Promise<Categoria[]> {
        const response = await api.get<Categoria[]>(`/categorias/tipo/${tipo}`);
        return response.data;
    },

    /**
     * Buscar categorias ativas por tipo
     */
    async findAtivasByTipo(tipo: TipoCategoria): Promise<Categoria[]> {
        const response = await api.get<Categoria[]>(
            `/categorias/tipo/${tipo}/ativas`
        );
        return response.data;
    },

    /**
     * Buscar categorias de despesa ativas
     */
    async findCategoriasDespesaAtivas(): Promise<Categoria[]> {
        const response = await api.get<Categoria[]>('/categorias/despesa/ativas');
        return response.data;
    },

    /**
     * Buscar categorias de receita ativas
     */
    async findCategoriasReceitaAtivas(): Promise<Categoria[]> {
        const response = await api.get<Categoria[]>('/categorias/receita/ativas');
        return response.data;
    },

    /**
     * Buscar categorias com despesas associadas
     */
    async findCategoriasComDespesas(): Promise<Categoria[]> {
        const response = await api.get<Categoria[]>('/categorias/com-despesas');
        return response.data;
    },

    /**
     * Buscar categorias sem despesas associadas
     */
    async findCategoriasSemDespesas(): Promise<Categoria[]> {
        const response = await api.get<Categoria[]>('/categorias/sem-despesas');
        return response.data;
    },

    /**
     * Buscar categorias mais usadas
     */
    async findMaisUsadas(): Promise<Categoria[]> {
        const response = await api.get<Categoria[]>('/categorias/mais-usadas');
        return response.data;
    },

    /**
     * Buscar categorias por nome
     */
    async searchByNome(nome: string): Promise<Categoria[]> {
        const response = await api.get<Categoria[]>('/categorias/search', {
            params: { nome },
        });
        return response.data;
    },

    /**
     * Atualizar categoria
     */
    async update(id: number, data: CategoriaRequestDTO): Promise<Categoria> {
        const response = await api.put<Categoria>(`/categorias/${id}`, data);
        return response.data;
    },

    /**
     * Ativar categoria
     */
    async ativar(id: number): Promise<Categoria> {
        const response = await api.patch<Categoria>(`/categorias/${id}/ativar`);
        return response.data;
    },

    /**
     * Desativar categoria
     */
    async desativar(id: number): Promise<Categoria> {
        const response = await api.patch<Categoria>(`/categorias/${id}/desativar`);
        return response.data;
    },

    /**
     * Deletar categoria permanentemente
     */
    async delete(id: number): Promise<void> {
        await api.delete(`/categorias/${id}`);
    },

    /**
     * Contar total de categorias
     */
    async count(): Promise<number> {
        const response = await api.get<number>('/categorias/count');
        return response.data;
    },

    /**
     * Contar categorias ativas
     */
    async countAtivas(): Promise<number> {
        const response = await api.get<number>('/categorias/count/ativas');
        return response.data;
    },

    /**
     * Contar categorias por tipo
     */
    async countByTipo(tipo: TipoCategoria): Promise<number> {
        const response = await api.get<number>(`/categorias/count/tipo/${tipo}`);
        return response.data;
    },

    /**
     * Contar despesas de uma categoria
     */
    async countDespesas(id: number): Promise<number> {
        const response = await api.get<number>(`/categorias/${id}/count-despesas`);
        return response.data;
    },

    /**
     * Agrupar categorias por tipo
     */
    async agruparPorTipo(): Promise<Record<string, number>> {
        const response = await api.get<Record<string, number>>(
            '/categorias/agrupar-tipo'
        );
        return response.data;
    },

    /**
     * Resumo de categorias
     */
    async getResumo(): Promise<CategoriaResumo> {
        const response = await api.get<CategoriaResumo>('/categorias/resumo');
        return response.data;
    },
};