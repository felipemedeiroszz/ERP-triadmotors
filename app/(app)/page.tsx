import { requireUser, requireAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { DashboardCharts, type DashboardChartsProps } from './dashboard-charts'
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react'

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Dinheiro',
  pix: 'PIX',
  debit: 'Débito',
  credit: 'Crédito',
  credit_term: 'Prazo',
}

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function getPeriodOfDay(hour: number): 'manha' | 'tarde' | 'noite' {
  if (hour < 12) return 'manha'
  if (hour < 18) return 'tarde'
  return 'noite'
}

export default async function DashboardPage() {
  const { profile } = await requireUser()
  const isAdmin = profile.role === 'admin'

  const supabase = await createClient()

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString()
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).toISOString()
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0).toISOString()
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString()
  const startOf30DaysAgo = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString()

  // ====== BASIC STATS (todos usuários) ======
  const [
    { data: todaySales },
    { count: todayCountRaw },
    { data: lowStockProducts },
    { data: openCommands },
    { data: monthSalesAll },
    { data: last30Sales },
    { data: saleItemsMonth },
    { data: stockProducts },
    { count: customersCount },
  ] = await Promise.all([
    supabase
      .from('sales')
      .select('total')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .eq('status', 'completed'),
    supabase
      .from('sales')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .eq('status', 'completed'),
    supabase
      .from('products')
      .select('id, name, stock, min_stock')
      .lt('stock', 'min_stock')
      .eq('active', true)
      .limit(5),
    supabase
      .from('commands')
      .select('id, number, total, due_date, customer_id')
      .eq('status', 'open')
      .limit(5),
    supabase
      .from('sales')
      .select('total, payment_method, created_at')
      .gte('created_at', startOfMonth)
      .eq('status', 'completed'),
    supabase
      .from('sales')
      .select('total, created_at')
      .gte('created_at', startOf30DaysAgo)
      .eq('status', 'completed'),
    supabase
      .from('sale_items')
      .select('name, quantity, total, sale_id')
      .gte('created_at', startOfMonth),
    supabase
      .from('products')
      .select('stock, min_stock')
      .eq('active', true),
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('active', true),
  ])

  // ====== ADMIN-ONLY QUERIES ======
  let monthSales = 0
  let monthSalesCount = 0
  let monthExpenses = 0
  let overdueCommands = 0
  let receivablesTotal = 0

  let expensesMonthAll: { category: string; amount: string | number }[] = []
  let prevMonthSalesTotal = 0
  let expensesPaid30d: { date: string; amount: string | number }[] = []

  let commandsPaidCount = 0
  let commandsOpenCount = 0
  let commandsOverdueCount = 0

  if (isAdmin) {
    const [
      { count: monthCountData },
      { data: expensesData },
      { count: overdueData },
      { data: receivablesData },
      { data: expensesMonthAllRaw },
      { data: prevMonthSales },
      { data: expenses30dRaw },
      { count: paidCountRaw },
      { count: openCountRaw },
      { count: overdueCountRaw },
    ] = await Promise.all([
      supabase
        .from('sales')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth)
        .eq('status', 'completed'),
      supabase
        .from('expenses')
        .select('amount')
        .gte('date', startOfMonth)
        .eq('status', 'paid'),
      supabase
        .from('commands')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open')
        .lt('due_date', now.toISOString().split('T')[0]),
      supabase
        .from('commands')
        .select('balance')
        .eq('status', 'open'),
      supabase
        .from('expenses')
        .select('category, amount')
        .gte('date', startOfMonth),
      supabase
        .from('sales')
        .select('total')
        .gte('created_at', startOfPrevMonth)
        .lte('created_at', endOfPrevMonth)
        .eq('status', 'completed'),
      supabase
        .from('expenses')
        .select('date, amount')
        .gte('date', startOf30DaysAgo.split('T')[0])
        .eq('status', 'paid'),
      supabase
        .from('commands')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'paid'),
      supabase
        .from('commands')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open'),
      supabase
        .from('commands')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open')
        .lt('due_date', now.toISOString().split('T')[0]),
    ])

    monthSales = Array.isArray(monthSalesAll)
      ? monthSalesAll.reduce((sum, s) => sum + Number(s.total), 0)
      : 0
    monthSalesCount = monthCountData ?? 0
    monthExpenses = Array.isArray(expensesData)
      ? expensesData.reduce((sum, e) => sum + Number(e.amount), 0)
      : 0
    overdueCommands = overdueData ?? 0
    receivablesTotal = Array.isArray(receivablesData)
      ? receivablesData.reduce((sum, c) => sum + Number(c.balance), 0)
      : 0

    expensesMonthAll = Array.isArray(expensesMonthAllRaw) ? expensesMonthAllRaw : []
    prevMonthSalesTotal = Array.isArray(prevMonthSales)
      ? prevMonthSales.reduce((sum, s) => sum + Number(s.total), 0)
      : 0
    expensesPaid30d = Array.isArray(expenses30dRaw) ? expenses30dRaw : []
    commandsPaidCount = paidCountRaw ?? 0
    commandsOpenCount = openCountRaw ?? 0
    commandsOverdueCount = overdueCountRaw ?? 0
  } else {
    monthSales = Array.isArray(monthSalesAll)
      ? monthSalesAll.reduce((sum, s) => sum + Number(s.total), 0)
      : 0
    monthSalesCount = monthSalesAll?.length ?? 0
  }

  const todayTotal = Array.isArray(todaySales)
    ? todaySales.reduce((sum, s) => sum + Number(s.total), 0)
    : 0
  const todayCount = todayCountRaw ?? 0
  const ticketAverage = todayCount > 0 ? todayTotal / todayCount : 0

  // ====== TRANSFORMAÇÃO PARA GRÁFICOS ======

  // 1. Pizza: Métodos de Pagamento do Mês
  const paymentMethodData: DashboardChartsProps['paymentMethodData'] = []
  if (Array.isArray(monthSalesAll)) {
    const byMethod = new Map<string, number>()
    for (const s of monthSalesAll) {
      const key = s.payment_method || 'outros'
      byMethod.set(key, (byMethod.get(key) ?? 0) + Number(s.total))
    }
    for (const [method, value] of byMethod.entries()) {
      paymentMethodData.push({ name: PAYMENT_LABELS[method] ?? method, value })
    }
    paymentMethodData.sort((a, b) => b.value - a.value)
  }

  // 2. Pirâmide (Funnel): Top 10 produtos por receita no mês
  const topProducts: DashboardChartsProps['topProducts'] = []
  if (Array.isArray(saleItemsMonth)) {
    const byProduct = new Map<string, { value: number; quantity: number }>()
    for (const it of saleItemsMonth) {
      const prev = byProduct.get(it.name) ?? { value: 0, quantity: 0 }
      byProduct.set(it.name, {
        value: prev.value + Number(it.total),
        quantity: prev.quantity + Number(it.quantity),
      })
    }
    const arr = [...byProduct.entries()]
      .map(([name, v]) => ({ name, value: v.value, quantity: v.quantity }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
    topProducts.push(...arr)
  }

  // 3. Círculos RadialBar: Meta do mês, Comandas, Estoque
  const estimatedGoal = prevMonthSalesTotal > 0 ? Math.round(prevMonthSalesTotal * 1.1) : 50000
  const metaMesPercent = estimatedGoal > 0 ? Math.min(100, Math.round((monthSales / estimatedGoal) * 100)) : 0

  const totalCommands = commandsPaidCount + commandsOpenCount
  const commandsHealth: DashboardChartsProps['commandsHealth'] = {
    pago: totalCommands > 0 ? Math.round((commandsPaidCount / totalCommands) * 100) : 0,
    aberto: totalCommands > 0 ? Math.round(((commandsOpenCount - commandsOverdueCount) / totalCommands) * 100) : 0,
    vencido: totalCommands > 0 ? Math.round((commandsOverdueCount / totalCommands) * 100) : 0,
    pagoCount: commandsPaidCount,
    abertoCount: Math.max(0, commandsOpenCount - commandsOverdueCount),
    vencidoCount: commandsOverdueCount,
  }

  const totalStock = Array.isArray(stockProducts) ? stockProducts.length : 0
  let stockOkCount = 0
  let stockLowCount = 0
  let stockZeroCount = 0
  if (Array.isArray(stockProducts)) {
    for (const p of stockProducts) {
      const s = Number(p.stock)
      const ms = Number(p.min_stock)
      if (s === 0) stockZeroCount++
      else if (s <= ms) stockLowCount++
      else stockOkCount++
    }
  }

  const totalStockPct = (n: number) => (totalStock > 0 ? Math.round((n / totalStock) * 100) : 0)
  const stockHealth: DashboardChartsProps['stockHealth'] = {
    adequado: totalStockPct(stockOkCount),
    baixo: totalStockPct(stockLowCount),
    zerado: totalStockPct(stockZeroCount),
    adequadoCount: stockOkCount,
    baixoCount: stockLowCount,
    zeradoCount: stockZeroCount,
  }

  // 4. Tendência últimos 30 dias (receita, custo estimado, lucro)
  const dailyTrend: DashboardChartsProps['dailyTrend'] = []
  const daysMap = new Map<string, { receita: number; custo: number }>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
    daysMap.set(key, { receita: 0, custo: 0 })
  }
  if (Array.isArray(last30Sales)) {
    for (const s of last30Sales) {
      const d = new Date(s.created_at)
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      const entry = daysMap.get(key)
      if (entry) entry.receita += Number(s.total)
    }
  }
  if (isAdmin) {
    for (const e of expensesPaid30d) {
      const d = new Date(String(e.date))
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      const entry = daysMap.get(key)
      if (entry) entry.custo += Number(e.amount)
    }
  }
  for (const [date, v] of daysMap.entries()) {
    dailyTrend.push({
      date,
      receita: Number(v.receita.toFixed(2)),
      custo: Number(v.custo.toFixed(2)),
      lucro: Number((v.receita - v.custo).toFixed(2)),
    })
  }

  // 5. Barras: Vendas por dia da semana + período
  const weekdaySales: DashboardChartsProps['weekdaySales'] = WEEKDAY_LABELS.map((d) => ({
    day: d,
    manha: 0,
    tarde: 0,
    noite: 0,
  }))
  if (Array.isArray(monthSalesAll)) {
    for (const s of monthSalesAll) {
      const d = new Date(s.created_at)
      const wd = weekdaySales[d.getDay()]
      const period = getPeriodOfDay(d.getHours())
      wd[period] += Number(s.total)
    }
  }
  for (const w of weekdaySales) {
    w.manha = Number(w.manha.toFixed(2))
    w.tarde = Number(w.tarde.toFixed(2))
    w.noite = Number(w.noite.toFixed(2))
  }

  // 6. Donut: Despesas por categoria (admin)
  const expenseCategory: DashboardChartsProps['expenseCategory'] = []
  if (isAdmin) {
    const byCat = new Map<string, number>()
    for (const e of expensesMonthAll) {
      const cat = e.category || 'Outros'
      byCat.set(cat, (byCat.get(cat) ?? 0) + Number(e.amount))
    }
    for (const [name, value] of byCat.entries()) {
      expenseCategory.push({ name, value })
    }
    expenseCategory.sort((a, b) => b.value - a.value)
  }

  // 7. Radar: performance multi-eixo (normalizado 0-100)
  const monthDaysElapsed = now.getDate()
  const monthDaysTotal = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const expectedDaily = estimatedGoal / monthDaysTotal
  const currentDaily = monthSales / Math.max(1, monthDaysElapsed)
  const vendasScore = Math.min(100, expectedDaily > 0 ? Math.round((currentDaily / expectedDaily) * 100) : 0)
  const ticketScore = Math.min(100, ticketAverage > 0 ? Math.round(Math.min(10, ticketAverage / 50) * 10) : 0)
  const clientesScore = Math.min(100, Math.round(((customersCount ?? 0) / 200) * 100))
  const estoqueScore = stockHealth.adequado
  const comandasScore = commandsHealth.pago
  const liquidezScore = receivablesTotal > 0
    ? Math.min(100, Math.round(((monthSales + 1) / (receivablesTotal + 1)) * 50))
    : 100

  const radarData: DashboardChartsProps['radarData'] = [
    { subject: 'Vendas', A: vendasScore, fullMark: 100 },
    { subject: 'Ticket Médio', A: ticketScore, fullMark: 100 },
    { subject: 'Clientes', A: clientesScore, fullMark: 100 },
    { subject: 'Estoque OK', A: estoqueScore, fullMark: 100 },
    { subject: 'Comandas Pagas', A: comandasScore, fullMark: 100 },
    { subject: 'Liquidez', A: liquidezScore, fullMark: 100 },
  ]

  const chartProps: DashboardChartsProps = {
    isAdmin,
    paymentMethodData,
    topProducts,
    dailyTrend,
    weekdaySales,
    radarData,
    metaMes: {
      percent: metaMesPercent,
      meta: estimatedGoal,
      atingido: monthSales,
    },
    commandsHealth,
    stockHealth,
    expenseCategory,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          {isAdmin ? 'Visão geral administrativa' : 'Visão geral'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Vendas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {todayTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-gray-500 mt-1">{todayCount} vendas</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Ticket Médio</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {ticketAverage.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Média de hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Comandas Abertas</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{openCommands?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {isAdmin && overdueCommands > 0 && (
                <span className="text-red-400">{overdueCommands} vencidas</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{lowStockProducts?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Produtos abaixo do mínimo</p>
          </CardContent>
        </Card>

        {isAdmin && (
          <>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Vendas do Mês</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {monthSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <p className="text-xs text-gray-500 mt-1">{monthSalesCount} vendas</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Despesas do Mês</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {monthExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total pago</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Contas a Receber</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {receivablesTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total em aberto</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Resultado Estimado</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {(monthSales - monthExpenses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <p className="text-xs text-gray-500 mt-1">Vendas - Despesas</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Section */}
      <DashboardCharts {...chartProps} />

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Produtos com Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts && lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">{product.name}</p>
                      <p className="text-xs text-gray-500">Mínimo: {product.min_stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-400">{product.stock} un</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum produto com estoque baixo</p>
            )}
          </CardContent>
        </Card>

        {/* Open Commands */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Comandas em Aberto</CardTitle>
          </CardHeader>
          <CardContent>
            {openCommands && openCommands.length > 0 ? (
              <div className="space-y-3">
                {openCommands.map((command) => (
                  <div key={command.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Comanda #{command.number}</p>
                      <p className="text-xs text-gray-500">
                        Vencimento: {new Date(command.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {Number(command.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma comanda em aberto</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
