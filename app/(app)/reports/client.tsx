'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { BarChart3, TrendingUp, Package, Users, DollarSign, Download, Calendar as CalendarIcon } from 'lucide-react'
import type { ReportsClientProps } from './types'

export function ReportsClient({ sales, products, customers }: ReportsClientProps) {
  const [reportType, setReportType] = useState<'sales' | 'products' | 'customers' | 'financial'>('sales')
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month')

  const filterSalesByPeriod = () => {
    const now = new Date()
    const today = new Date(now.setHours(0, 0, 0, 0))
    const weekAgo = new Date(now.setDate(now.getDate() - 7))
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
    const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1))

    return sales.filter((sale) => {
      const saleDate = new Date(sale.created_at)
      switch (period) {
        case 'today':
          return saleDate >= today
        case 'week':
          return saleDate >= weekAgo
        case 'month':
          return saleDate >= monthAgo
        case 'year':
          return saleDate >= yearAgo
        default:
          return true
      }
    })
  }

  const filteredSales = filterSalesByPeriod()

  const generateSalesReport = () => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.total), 0)
    const salesCount = filteredSales.length
    const avgTicket = salesCount > 0 ? totalRevenue / salesCount : 0

    const byPaymentMethod = filteredSales.reduce((acc, sale) => {
      acc[sale.payment_method] = (acc[sale.payment_method] || 0) + Number(s.total)
      return acc
    }, {} as Record<string, number>)

    return {
      totalRevenue,
      salesCount,
      avgTicket,
      byPaymentMethod,
    }
  }

  const generateProductsReport = () => {
    const lowStock = products.filter((p) => p.stock < 5)
    const outOfStock = products.filter((p) => p.stock === 0)
    const totalStockValue = products.reduce((sum, p) => sum + (p.stock * Number(p.sale_price)), 0)

    return {
      totalProducts: products.length,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      totalStockValue,
    }
  }

  const generateCustomersReport = () => {
    return {
      totalCustomers: customers.length,
    }
  }

  const generateFinancialReport = () => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.total), 0)
    return {
      totalRevenue,
    }
  }

  const currentReport = (() => {
    switch (reportType) {
      case 'sales':
        return generateSalesReport()
      case 'products':
        return generateProductsReport()
      case 'customers':
        return generateCustomersReport()
      case 'financial':
        return generateFinancialReport()
      default:
        return {}
    }
  })()

  const exportCSV = () => {
    let csv = ''
    let filename = ''

    if (reportType === 'sales') {
      csv = 'Data,Total,Forma de Pagamento\n'
      filteredSales.forEach((sale) => {
        csv += `${new Date(sale.created_at).toLocaleDateString('pt-BR')},${sale.total},${sale.payment_method}\n`
      })
      filename = 'vendas.csv'
    } else if (reportType === 'products') {
      csv = 'Nome,Estoque,Preço\n'
      products.forEach((product) => {
        csv += `${product.name},${product.stock},${product.sale_price}\n`
      })
      filename = 'produtos.csv'
    } else if (reportType === 'customers') {
      csv = 'Nome\n'
      customers.forEach((customer) => {
        csv += `${customer.name}\n`
      })
      filename = 'clientes.csv'
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <Label className="text-gray-300">Tipo de Relatório</Label>
          <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="sales">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Vendas
                </div>
              </SelectItem>
              <SelectItem value="products">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Produtos
                </div>
              </SelectItem>
              <SelectItem value="customers">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Clientes
                </div>
              </SelectItem>
              <SelectItem value="financial">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Financeiro
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-2">
          <Label className="text-gray-300">Período</Label>
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button onClick={exportCSV} className="bg-gray-700 hover:bg-gray-600 text-white">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Report Content */}
      {reportType === 'sales' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {currentReport.totalRevenue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Vendas</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currentReport.salesCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {currentReport.avgTicket?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 md:col-span-3">
            <CardHeader>
              <CardTitle className="text-white">Vendas por Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(currentReport.byPaymentMethod || {}).map(([method, total]) => (
                  <div key={method} className="flex justify-between">
                    <span className="text-gray-400 capitalize">{method}</span>
                    <span className="text-white font-medium">
                      {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currentReport.totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Estoque Baixo</CardTitle>
              <Package className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currentReport.lowStockCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Sem Estoque</CardTitle>
              <Package className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currentReport.outOfStockCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Valor em Estoque</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {currentReport.totalStockValue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'customers' && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{currentReport.totalCustomers}</div>
          </CardContent>
        </Card>
      )}

      {reportType === 'financial' && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Receita do Período</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {currentReport.totalRevenue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
