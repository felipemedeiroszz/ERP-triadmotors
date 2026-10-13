import { requireAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react'

export default async function FinancialPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Get date ranges
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999).toISOString()

  // Fetch financial data
  const [
    { data: todaySales },
    { data: monthSales },
    { data: lastMonthSales },
    { data: monthExpenses },
    { data: lastMonthExpenses },
    { data: receivables },
    { data: commandPayments },
  ] = await Promise.all([
    supabase.from('sales').select('total').gte('created_at', startOfDay).lte('created_at', endOfDay).eq('status', 'completed'),
    supabase.from('sales').select('total').gte('created_at', startOfMonth).eq('status', 'completed'),
    supabase.from('sales').select('total').gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth).eq('status', 'completed'),
    supabase.from('expenses').select('amount').gte('date', startOfMonth).eq('status', 'paid'),
    supabase.from('expenses').select('amount').gte('date', startOfLastMonth).lte('date', endOfLastMonth).eq('status', 'paid'),
    supabase.from('commands').select('balance').eq('status', 'open'),
    supabase.from('command_payments').select('amount, created_at').gte('created_at', startOfMonth),
  ])

  const todayRevenue = todaySales?.reduce((sum, s) => sum + Number(s.total), 0) || 0
  const monthRevenue = monthSales?.reduce((sum, s) => sum + Number(s.total), 0) || 0
  const lastMonthRevenue = lastMonthSales?.reduce((sum, s) => sum + Number(s.total), 0) || 0
  const monthExpensesTotal = monthExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0
  const lastMonthExpensesTotal = lastMonthExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0
  const receivablesTotal = receivables?.reduce((sum, c) => sum + Number(c.balance), 0) || 0
  const monthReceipts = commandPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  const monthProfit = monthRevenue - monthExpensesTotal
  const lastMonthProfit = lastMonthRevenue - lastMonthExpensesTotal

  const revenueGrowth = lastMonthRevenue > 0
    ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0

  const profitGrowth = lastMonthProfit > 0
    ? ((monthProfit - lastMonthProfit) / Math.abs(lastMonthProfit)) * 100
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Financeiro</h1>
        <p className="text-gray-400 mt-1">Visão geral financeira do negócio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Receita Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {todayRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Receita Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {monthRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div className="flex items-center text-xs mt-1">
              {revenueGrowth >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(revenueGrowth).toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Lucro Mensal</CardTitle>
            <Wallet className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {monthProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div className="flex items-center text-xs mt-1">
              {profitGrowth >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={profitGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(profitGrowth).toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Contas a Receber</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {receivablesTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total em aberto</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Resumo Mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Receita de Vendas</span>
              <span className="text-green-400 font-medium">
                {monthRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Recebimentos de Comandas</span>
              <span className="text-green-400 font-medium">
                {monthReceipts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Total Entradas</span>
              <span className="text-green-400 font-bold">
                {(monthRevenue + monthReceipts).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Despesas Pagas</span>
              <span className="text-red-400 font-medium">
                {monthExpensesTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-white font-medium">Resultado do Mês</span>
              <span className={`font-bold ${monthProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {monthProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Indicadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Margem de Lucro</span>
              <span className="text-white font-medium">
                {monthRevenue > 0 ? ((monthProfit / monthRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Despesas / Receita</span>
              <span className="text-white font-medium">
                {monthRevenue > 0 ? ((monthExpensesTotal / monthRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Receita por Comanda</span>
              <span className="text-white font-medium">
                {receivables.length > 0
                  ? (receivablesTotal / receivables.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : 'R$ 0,00'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Recebimento Médio</span>
              <span className="text-white font-medium">
                {commandPayments.length > 0
                  ? (monthReceipts / commandPayments.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : 'R$ 0,00'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
