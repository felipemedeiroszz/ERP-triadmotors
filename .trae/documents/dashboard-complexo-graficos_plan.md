# Dashboard Complexo com Gráficos Implementation Plan

## Repository Research

### Arquitetura atual
- **Framework:** Next.js 16.4.0 (App Router) com Turbopack, React 19, Server Components por padrão
- **Banco:** Supabase (PostgreSQL) com RLS habilitado em todas tabelas
- **UI:** shadcn components + @base-ui/react + Tailwind v4
- **Gráficos:** `recharts@3.8.0` já instalado; componente wrapper [chart.tsx](file:///c:/Users/Felipe/Documents/sistema-erp-pdv-triad-moto/components/ui/chart.tsx) com `ChartContainer`, `ChartTooltip`, `ChartLegend` prontos
- **Padrão de módulo:** outros módulos (pdv, sales, expenses, commands) seguem `page.tsx` (Server Component fetch dados) → `client.tsx` ('use client' com interatividade/gráficos)

### Página atual ([page.tsx](file:///c:/Users/Felipe/Documents/sistema-erp-pdv-triad-moto/app/(app)/page.tsx))
- 4-8 KPI Cards (Vendas Hoje / Ticket Médio / Comandas Abertas / Estoque Baixo + 4 cards Admin: Vendas Mês, Despesas Mês, Contas a Receber, Resultado)
- 2 listas simples (Estoque Baixo, Comandas Abertas)
- **Sem gráficos ainda**

### Tabelas relevantes disponíveis no schema ([schema.sql](file:///c:/Users/Felipe/Documents/sistema-erp-pdv-triad-moto/supabase/schema.sql))
- `sales`: `total`, `payment_method` (cash/pix/debit/credit/credit_term), `created_at`, `status`, `user_id`
- `sale_items`: `name`, `quantity`, `total`, `product_id`, `sale_id`
- `products`: `category_id`, `brand_id`, `stock`, `min_stock`, `active`
- `categories`: `id`, `name`
- `expenses`: `category`, `amount`, `date`, `status`
- `commands`: `status` (open/paid/cancelled), `balance`, `due_date`
- `stock_movements`: `type` (in/out/adjustment), `quantity`, `created_at`

### Solicitação do usuário
> "faça o dashboard com graficos de piramide, pizza, circulos. deixe complexo"

Tipos Recharts mapeados:
- **Pizza** → `PieChart` + `Pie` (Padrão)
- **Pirâmide** → `FunnelChart` + `Funnel` (formato triangular/piramidal) OU barras horizontais invertidas; Recharts tem Funnel nativo.
- **Círculos** → `RadialBarChart` (múltiplos anéis/círculos de progresso) e `PieChart` com `innerRadius` (Donut/Rosca)

Além destes, vou adicionar complementos para ficar "complexo":
- Área composta (Receitas vs Despesas últimos 30 dias)
- Barras agrupadas (Vendas por dia da semana + período)
- Gráfico de radar (performance dimensões: Vendas, Estoque, Clientes, Despesas, etc.)

---

## Files and Modules

### 1. Novo arquivo: `app/(app)/dashboard-charts.tsx` ('use client')
- Componente **client-side** que recebe todos dados via props
- Renderiza toda seção de gráficos: Pizza, Pirâmide (Funnel), Círculos (RadialBar + Donuts), Área, Barras, Radar
- Usa `ChartContainer` de [chart.tsx](file:///c:/Users/Felipe/Documents/sistema-erp-pdv-triad-moto/components/ui/chart.tsx) + componentes nativos `recharts`
- Responsável por paleta dark, formatação BRL, labels, tooltips customizadas

### 2. Modificado: `app/(app)/page.tsx` (Server Component)
- **Mantém** as queries básicas + KPI + listas já existentes
- **Adiciona queries avançadas** (no bloco `isAdmin` para a maioria) para alimentar os gráficos:
  - Vendas agrupadas por `payment_method` (→ Pizza)
  - Top 10 produtos por receita (qtd * preço) (→ Pirâmide Funnel)
  - 3 Radial Bars (círculos):
    - % Comandas pagas vs abertas vs vencidas
    - % Estoque adequado / baixo / crítico / zerado
    - % Meta do mês atingida (vendas atuais / meta — com fallback de meta baseado em último mês ou valor fixo)
  - Últimos 30 dias: receita diária, custo diário (profit diário) (→ Area/Line composto)
  - Vendas por dia da semana + manhã/tarde/noite (→ Barras agrupadas)
  - Distribuição de despesas por categoria (→ Donut)
  - Radar com 6 eixos (Vendas, Ticket Médio, Clientes, Estoque Saudável, Baixa Rotatividade, Liquidez)
- Passa todos dados processados como props para `<DashboardCharts />`

### 3. Nenhum novo componente em `components/ui/`
- wrapper `ChartContainer` já supre necessidade

---

## Implementation Steps (ordem de dependências)

### Passo 1: Expandir queries em `page.tsx`
- Adicionar `~10 queries novas` dentro do bloco Admin (algumas compartilhadas com user comum):
  - `salesByPaymentMethod`: groupBy via JS pós-query (Supabase não tem groupBy agregador nativo via JS client com sum) OU múltiplas queries count por método. Melhor: fetch todas vendas do mês + `.reduce()` agrupando.
  - `topProductsByRevenue`: `sale_items` join `sales` (apenas completadas do mês) + agrupar por `product_id`/`name` + ordenar + limit 10
  - `commandsStatusCounts`: 3 queries separadas (open paid/count + open/count + overdue/count)
  - `stockHealthCounts`: 4 queries (adequado=stock>min_stock; baixo=0<stock<=min; critico=stock<min*0.5; zerado=stock=0)
  - `dailyRevenueLast30`: vendas completadas últimos 30d, processar em JS para array [{ date, revenue, profit }]
  - `weekdaySales`: mesclar vendas do mês, agrupar por dia semana + período do dia
  - `expensesByCategory`: expenses do mês agrupados por category
  - `monthGoalMeta`: cálculo baseado em mês anterior * 1.1 (se existir), fallback R$50k
- Transformar dados para formato Recharts (array de objetos planos com keys string/number)
- Passar via props para novo `<DashboardCharts isAdmin={...} ... />`
- **Manter fallback zero** para quando tabelas ainda estiverem vazias (evita crash first-run)

### Passo 2: Criar `dashboard-charts.tsx` com todos gráficos
Marcação recomendada de layout:
```
<Section Title="Análise de Vendas">
  <Grid 1/2 : PieChart Pagamento  |  Grid 1/2 : Donut Despesas Categoria>
</Section>
<Section Title="Produtos (Pirâmide)">
  <Grid 1 : FunnelChart Top 10 Produtos (eixo esq: nome produto, cor gradiente)>
</Section>
<Section Title="Saúde do Negócio (Círculos)">
  <Grid 1/3 : RadialBar % Meta Mês | Grid 1/3 : RadialBar Comandas Status | Grid 1/3 : RadialBar Estoque>
</Section>
<Section Title="Desempenho Temporal">
  <Grid 1 : AreaChart últimos 30 dias (3 séries: receita, custo, lucro)>
  <Grid 1/2 + 1/2 : BarChart dia da semana (agrupado manhã/tarde/noite) | RadarChart 6 eixos>
</Section>
```
- Aplicar **paleta dark custom** (vermelho tm-red primary, verde para lucro, gradiente roxo-azul para pizza/funnel) com tokens de [chart.tsx](file:///c:/Users/Felipe/Documents/sistema-erp-pdv-triad-moto/components/ui/chart.tsx) `ChartConfig` via `--color-*`
- Tooltip formatado em pt-BR com `Intl.NumberFormat` BRL currency + milhar
- Empty state para cada gráfico quando dados.length === 0 (renderiza card com mensagem "Sem dados no período" + ícone)

### Passo 3: Integrar `page.tsx` → `<DashboardCharts />`
- Inserir `<DashboardCharts />` **abaixo** dos KPI Cards e **acima** das listas (Estoque Baixo / Comandas Abertas) para hierarquia visual
- Passar `isAdmin` como prop pois gráficos de Despesas e Meta são admin-only; gráficos de circulo parcialmente compartilhados

### Passo 4: Revisão de segurança/permissões
- Garantir RLS respeitado: employees só enxergam próprias sales via policy existente; gráficos que usam expenses são renderizados null quando `!isAdmin`
- Nenhum dado sensível (custo, margem) exposto a employee (mantém padrão products policy — no caso de gráfico de produtos, usar `sale_items.unit_price` (preço de venda) e não `cost_price`)

---

## Dependencies and Considerations
- `recharts@3.8.0` já instalado → sem `npm install`
- Server + Client boundary: **TODO gráfico Recharts** precisa viver no componente cliente ('use client'). page.tsx deve apenas buscar e transformar dados e passar props.
- Performance: ~10 queries Supabase em paralelo com `Promise.all` expandido (evita N+1). Usar `.select(...).returns<...>` minimal columns sempre que possível.
- Datas: filtrar vendas completadas apenas; timezone considerar hoje em TZ local mas Supabase usa UTC → manter padrão atual com `.toISOString()`
- Fallback de meta do mês: caso não exista venda mês anterior, usar valor fixo `50000` e exibir observação no card "Meta estimada"
- Pirâmide (Funnel): Recharts `FunnelChart` renderiza formato de pirâmide perfeito; se houver só 1-2 produtos, fallback para BarChart horizontal para não ficar esquisito

---

## Validation
1. **Visualização inicial** com dados vazios → nenhum gráfico crasha, todos exibem empty state
2. **TypeScript:** `npx tsc --noEmit` **sem erros nas páginas/arquivos novos** (outros erros pré-existentes são ignorados)
3. **GetDiagnostics** → 0 diagnostics em arquivos alterados/criados
4. **Runtime check:** abrir `/` no browser e confirmar:
   - Nenhum `<button>` aninhado (regressão do fix anterior)
   - Todos 8 gráficos renderizam (Pizza, Donut, Funnel, 3 RadialBars, Area, Bar, Radar)
   - Tooltip aberto mostra R$ formatado corretamente
   - Trocando de conta admin → employee: gráficos admin desaparecem sem erro
5. **Dados:** se existir ao menos 1 venda completa de exemplo com `cash` + outra com `pix`, Pizza mostra 2 fatias; se tiver 5+ produtos vendidos, Pirâmide aparece com múltiplos níveis

---

## Risks
- **Risco:** Nenhuma venda no banco → gráficos aparecem todos vazios, usuário acha que não funciona  
  → **Mitigação:** Empty state bonito em cada gráfico com mensagem explicativa + sugestão de "Crie uma venda primeiro para ver os gráficos"

- **Risco:** Política RLS de `sale_items` (para employees, requer join com `sales` da própria pessoa) quebrar queries não-admin  
  → **Mitigação:** Gráfico de top products usa user_id se employee, ou tudo se admin; fallback `[]` se erro

- **Risco:** Diferença semântica "pirâmide" vs Funnel  
  → **Mitigação:** Usar Funnel (triangular) como padrão, além dele um gráfico de barras horizontais como "Pirâmide de Produtos" para reforçar a percepção visual

- **Risco:** Performance de ~10 queries paralelas no first load  
  → **Mitigação:** Todas as queries adicionais são `count` ou `limit 10` + indexes existentes (idx_sales_date, idx_sales_payment, etc)
