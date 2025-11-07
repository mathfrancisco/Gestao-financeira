# Diagrama de Dashboard com Cache

## Visão Geral

Este documento detalha o fluxo de carregamento do dashboard com estratégia de cache em múltiplas camadas utilizando Caffeine [web:17][web:20].

## Arquitetura de Cache

┌─────────────────────────────────────────────────────────────┐
│ ESTRATÉGIA DE CACHE │
├─────────────────────────────────────────────────────────────┤
│ │
│ Camada 1: React Query (Frontend) │
│ ├─ TTL: 5 minutos │
│ ├─ Stale-while-revalidate │
│ └─ Cache por query key │
│ │
│ Camada 2: Caffeine (Backend - Local Memory) │
│ ├─ Dashboard: 5 minutos │
│ ├─ Resumos: 10 minutos │
│ ├─ Parâmetros: 1 hora │
│ ├─ Categorias: 30 minutos │
│ ├─ Max Size: 1000 entradas │
│ └─ Eviction: LRU │
│ │
│ Camada 3: PostgreSQL (Source of Truth) │
│ ├─ Índices otimizados │
│ └─ Queries eficientes │
│ │
└─────────────────────────────────────────────────────────────┘

text

## Fluxo: Primeira Requisição (Cache Miss)

┌──────┐ ┌──────────┐
│Client│ │ Backend │
└──┬───┘ └────┬─────┘
│ │
│ GET /api/dashboard?mes=11&ano=2025 │
│ Headers: Authorization: Bearer {token} │
├────────────────────────────────────────────────────────────────>│
│ │
│ ┌──────────────────────┐ │
│ │ DashboardController │ │
│ │ - getDashboard() │ │
│ └──────────┬───────────┘ │
│ │ │
│ ┌──────────▼───────────┐ │
│ │ DashboardService │ │
│ │ @Cacheable("dashboard") │
│ └──────────┬───────────┘ │
│ │ │
│ │ 1. Verifica cache │
│ ┌──────────▼───────────┐ │
│ │ Caffeine Cache │ │
│ │ Key: "1-11-2025" │ │
│ └──────────┬───────────┘ │
│ │ │
│ │ MISS ❌ │
│ │ │
│ │ 2. Busca receitas │
│ ┌──────────▼───────────┐ │
│ │ ReceitaRepository │ │
│ │ - findByUsuarioId │ │
│ │ AndPeriodo() │ │
│ └──────────┬───────────┘ │
│ │ │
│ ┌──────────▼───────────┐ │
│ │ PostgreSQL │ │
│ │ SELECT SUM(salario + │ │
│ │ auxilios + │ │
│ │ servicos_extras) │ │
│ │ FROM receitas │ │
│ │ WHERE usuario_id = 1 │ │
│ │ AND periodo_inicio │ │
│ │ BETWEEN ... │ │
│ └──────────┬───────────┘ │
│ │ │
│ │ Resultado: 3500.00 │
│ │ │
│ │ 3. Busca despesas │
│ ┌──────────▼───────────┐ │
│ │ DespesaRepository │ │
│ │ - findByUsuarioId │ │
│ │ AndPeriodo() │ │
│ └──────────┬───────────┘ │
│ │ │
│ ┌──────────▼───────────┐ │
│ │ PostgreSQL │ │
│ │ SELECT │ │
│ │ SUM(valor), │ │
│ │ categoria_id, │ │
│ │ COUNT(*) │ │
│ │ FROM despesas │ │
│ │ WHERE usuario_id = 1 │ │
│ │ AND data BETWEEN │ │
│ │ GROUP BY categoria_id│ │
│ └──────────┬───────────┘ │
│ │ │
│ │ 4. Busca metas │
│ ┌──────────▼───────────┐ │
│ │ MetaRepository │ │
│ │ - findByUsuarioId() │ │
│ └──────────┬───────────┘ │
│ │ │
│ ┌──────────▼───────────┐ │
│ │ PostgreSQL │ │
│ │ SELECT * │ │
│ │ FROM metas │ │
│ │ WHERE usuario_id = 1 │ │
│ │ AND status != 'CONCLUIDA' │
│ └──────────┬───────────┘ │
│ │ │
│ │ 5. Processa dados │
│ ┌──────────▼───────────┐ │
│ │ CalculadoraFinanceira│ │
│ │ - calcularSaldo() │ │
│ │ - calcularPercentuais│ │
│ │ - agruparCategorias()│ │
│ └──────────┬───────────┘ │
│ │ │
│ │ 6. Monta DTO │
│ ┌──────────▼───────────┐ │
│ │ DashboardResponseDTO │ │
│ │ { │ │
│ │ totalReceitas, │ │
│ │ totalDespesas, │ │
│ │ saldo, │ │
│ │ despesasPorCategoria, │
│ │ metasAtivas │ │
│ │ } │ │
│ └──────────┬───────────┘ │
│ │ │
│ │ 7. Armazena no cache │
│ ┌──────────▼───────────┐ │
│ │ Caffeine Cache │ │
│ │ PUT("1-11-2025", │ │
│ │ dashboardDTO, │ │
│ │ TTL: 5min) │ │
│ └──────────────────────┘ │
│ │
│ HTTP 200 OK │
│ { │
│ "totalReceitas": 3500.00, │
│ "totalDespesas": 2300.00, │
│ "saldo": 1200.00, │
│ "despesasPorCategoria": [ │
│ { │
│ "categoria": "Moradia", │
│ "valor": 1200.00, │
│ "percentual": 52.17 │
│ }, │
│ { │
│ "categoria": "Alimentação", │
│ "valor": 800.00, │
│ "percentual": 34.78 │
│ } │
│ ], │
│ "metasAtivas": [ │
│ { │
│ "nome": "Viagem", │
│ "valorObjetivo": 5000.00, │
│ "valorAtual": 2500.00, │
│ "progresso": 50.00 │
│ } │
│ ], │
│ "cached": false │
│ } │
│<────────────────────────────────────────────────────────────────┤
│ │
│ ⏱️ Tempo de resposta: ~200ms │

text

## Fluxo: Segunda Requisição (Cache Hit)

┌──────┐ ┌──────────┐
│Client│ │ Backend │
└──┬───┘ └────┬─────┘
│ │
│ GET /api/dashboard?mes=11&ano=2025 │
│ Headers: Authorization: Bearer {token} │
├────────────────────────────────────────────────────────────────>│
│ │
│ ┌──────────────────────┐ │
│ │ DashboardController │ │
│ │ - getDashboard() │ │
│ └──────────┬───────────┘ │
│ │ │
│ ┌──────────▼───────────┐ │
│ │ DashboardService │ │
│ │ @Cacheable("dashboard") │
│ └──────────┬───────────┘ │
│ │ │
│ │ 1. Verifica cache │
│ ┌──────────▼───────────┐ │
│ │ Caffeine Cache │ │
│ │ Key: "1-11-2025" │ │
│ └──────────┬───────────┘ │
│ │ │
│ │ HIT ✅ │
│ │ Retorna valor │
│ │ armazenado │
│ │ │
│ HTTP 200 OK │
│ { │
│ "totalReceitas": 3500.00, │
│ "totalDespesas": 2300.00, │
│ "saldo": 1200.00, │
│ "despesasPorCategoria": [...], │
│ "metasAtivas": [...], │
│ "cached": true │
│ } │
│<────────────────────────────────────────────────────────────────┤
│ │
│ ⏱️ Tempo de resposta: ~5ms (40x mais rápido!) │

text

## Fluxo: Invalidação de Cache

┌──────┐ ┌──────────┐
│Client│ │ Backend │
└──┬───┘ └────┬─────┘
│ │
│ POST /api/despesas │
│ { nova despesa } │
├──────────────────────────────────────────────────────>│
│ │
│ ┌──────────────────┐ │
│ │ DespesaService │ │
│ │ - salvarDespesa()│ │
│ └────────┬─────────┘ │
│ │ │
│ │ 1. Salva despesa │
│ ┌────────▼─────────┐ │
│ │DespesaRepository │ │
│ │ - save() │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 2. Invalida cache │
│ ┌────────▼─────────┐ │
│ │ @CacheEvict │ │
│ │ value="dashboard"│ │
│ │ key="#usuarioId" │ │
│ │ allEntries=true │ │
│ └────────┬─────────┘ │
│ │ │
│ ┌────────▼─────────┐ │
│ │ Caffeine Cache │ │
│ │ EVICT("1-*") │ │
│ │ ✅ Cache limpo │ │
│ └──────────────────┘ │
│ │
│ HTTP 201 Created │
│ { despesa criada } │
│<──────────────────────────────────────────────────────┤
│ │
│ Próxima requisição ao dashboard será MISS │
│ e recarregará dados atualizados do banco │

text

## Configuração Caffeine Cache

### application.properties

Caffeine Cache
spring.cache.type=caffeine
spring.cache.caffeine.spec=maximumSize=1000,expireAfterWrite=5m
spring.cache.cache-names=dashboard,resumos,parametros,categorias

TTL específicos
cache.dashboard.ttl=300
cache.resumos.ttl=600
cache.parametros.ttl=3600
cache.categorias.ttl=1800

text

### CacheConfig.java

@EnableCaching
@Configuration
public class CacheConfig {

text
@Bean
public Caffeine<Object, Object> caffeineConfig() {
    return Caffeine.newBuilder()
        .expireAfterWrite(5, TimeUnit.MINUTES)
        .maximumSize(1000)
        .recordStats() // Para métricas
        .removalListener((key, value, cause) -> {
            log.debug("Cache evicted - Key: {}, Cause: {}", key, cause);
        });
}

@Bean
public CacheManager cacheManager(Caffeine caffeine) {
    CaffeineCacheManager cacheManager = new CaffeineCacheManager(
        "dashboard", "resumos", "parametros", "categorias"
    );
    cacheManager.setCaffeine(caffeine);
    return cacheManager;
}
}

text

### Service com Cache

@Service
@RequiredArgsConstructor
public class DashboardService {

text
private final ReceitaRepository receitaRepository;
private final DespesaRepository despesaRepository;
private final MetaRepository metaRepository;

@Cacheable(
    value = "dashboard", 
    key = "#usuarioId + '-' + #mes + '-' + #ano",
    unless = "#result == null"
)
public DashboardResponseDTO getDashboard(Long usuarioId, int mes, int ano) {
    log.info("Cache MISS - Buscando dashboard do banco de dados");
    
    LocalDate inicio = LocalDate.of(ano, mes, 1);
    LocalDate fim = inicio.plusMonths(1).minusDays(1);
    
    // Busca receitas
    BigDecimal totalReceitas = receitaRepository
        .sumByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
    
    // Busca despesas
    BigDecimal totalDespesas = despesaRepository
        .sumByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
    
    // Busca metas
    List<Meta> metasAtivas = metaRepository
        .findByUsuarioIdAndStatusNot(usuarioId, StatusMeta.CONCLUIDA);
    
    // Monta DTO
    return DashboardResponseDTO.builder()
        .totalReceitas(totalReceitas)
        .totalDespesas(totalDespesas)
        .saldo(totalReceitas.subtract(totalDespesas))
        .metasAtivas(mapMetas(metasAtivas))
        .cached(false)
        .build();
}

@CacheEvict(
    value = {"dashboard", "resumos"}, 
    key = "#usuarioId + '-*'",
    allEntries = true
)
public void invalidarCache(Long usuarioId) {
    log.info("Cache invalidado para usuário: {}", usuarioId);
}
}

text

## Métricas de Cache

### Endpoints de Monitoramento

Estatísticas do cache
GET /actuator/metrics/cache.gets?tag=name:dashboard
GET /actuator/metrics/cache.puts?tag=name:dashboard
GET /actuator/metrics/cache.evictions?tag=name:dashboard

Hit rate
GET /actuator/metrics/cache.hit.ratio?tag=name:dashboard

text

### Exemplo de Resposta

{
"name": "cache.gets",
"measurements": [
{
"statistic": "COUNT",
"value": 1500
}
],
"availableTags": [
{
"tag": "result",
"values": ["hit", "miss"]
}
]
}

text

## Estratégias de Cache

### Por Tipo de Dado

| Tipo | TTL | Estratégia | Motivo |
|------|-----|------------|--------|
| Dashboard | 5min | Time-based | Dados mudam frequentemente |
| Resumos | 10min | Time-based | Cálculos pesados |
| Parâmetros | 1h | Time-based | Dados raramente mudam |
| Categorias | 30min | Time-based | Moderadamente estável |

### Invalidação

1. **Invalidação Explícita**: Após criar/atualizar/deletar dados
2. **Invalidação por TTL**: Expira automaticamente após tempo definido
3. **Invalidação por Tamanho**: LRU quando atinge 1000 entradas
4. **Invalidação Manual**: Via endpoint `/actuator/caches/{cacheName}`

## Benefícios

- **Performance**: 40x mais rápido em cache hits
- **Redução de Carga no DB**: Menos queries ao PostgreSQL
- **Melhor UX**: Dashboard carrega instantaneamente
- **Escalabilidade**: Suporta mais usuários simultâneos
- **Zero Config Redis**: Não precisa de servidor externo (futuro)

## Próximos Passos

Para ambientes com múltiplas instâncias do backend, considerar implementação de Redis para cache distribuído [web:17][web:20].
