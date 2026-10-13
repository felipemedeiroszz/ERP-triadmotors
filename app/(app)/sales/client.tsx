'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Receipt, Calendar as CalendarIcon, Eye, Printer, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Profile } from '@/lib/types'

interface SalesClientProps {
  initialSales: any[]
  userProfile: Profile
}

export function SalesClient({ initialSales, userProfile }: SalesClientProps) {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'pix' | 'debit' | 'credit' | 'credit_term'>('all')
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; sale: any }>({ open: false, sale: null })
  const [saleItems, setSaleItems] = useState<any[]>([])

  const filteredSales = initialSales.filter((sale) => {
    const matchesSearch =
      sale.number.toString().includes(searchTerm) ||
      (sale.customer?.name && sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sale.user?.full_name && sale.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || sale.payment_method === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge className="bg-green-600">Concluída</Badge>
    }
    if (status === 'cancelled') {
      return <Badge className="bg-red-600">Cancelada</Badge>
    }
    return <Badge className="bg-gray-600">{status}</Badge>
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Dinheiro',
      pix: 'PIX',
      debit: 'Débito',
      credit: 'Crédito',
      credit_term: 'A Prazo',
    }
    return labels[method] || method
  }

  const viewSaleDetails = async (sale: any) => {
    try {
      const { data: items } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', sale.id)

      setSaleItems(items || [])
      setDetailDialog({ open: true, sale })
    } catch (error) {
      console.error('Error fetching sale items:', error)
    }
  }

  const printReceipt = async (sale: any) => {
    try {
      // Fetch company settings
      const { data: settings } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (!settings) {
        toast.error('Configurações da empresa não encontradas')
        return
      }

      // Fetch sale items
      const { data: items } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', sale.id)

      if (!items) {
        toast.error('Erro ao carregar itens da venda')
        return
      }

      // Generate receipt HTML
      const { generateReceiptHTML, printReceipt } = await import('@/lib/receipt')
      const html = generateReceiptHTML(
        {
          company: settings,
          sale: sale,
          items: items,
        },
        settings.receipt_format as '58' | '80' | 'a4'
      )

      printReceipt(html)
    } catch (error) {
      console.error('Error printing receipt:', error)
      toast.error('Erro ao imprimir comprovante')
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por número, cliente ou funcionário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={(value: any) => setPaymentFilter(value)}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">Todas Formas</SelectItem>
              <SelectItem value="cash">Dinheiro</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="debit">Débito</SelectItem>
              <SelectItem value="credit">Crédito</SelectItem>
              <SelectItem value="credit_term">A Prazo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border border-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Número</TableHead>
                <TableHead className="text-gray-400">Data</TableHead>
                <TableHead className="text-gray-400">Cliente</TableHead>
                <TableHead className="text-gray-400">Funcionário</TableHead>
                <TableHead className="text-gray-400">Total</TableHead>
                <TableHead className="text-gray-400">Pagamento</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    Nenhuma venda encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="text-white font-mono">#{sale.number}</TableCell>
                    <TableCell className="text-gray-400">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(sale.created_at).toLocaleString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{sale.customer?.name || 'Consumidor final'}</TableCell>
                    <TableCell className="text-gray-400">{sale.user?.full_name}</TableCell>
                    <TableCell className="text-white font-medium">
                      {Number(sale.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-gray-400">{getPaymentMethodLabel(sale.payment_method)}</TableCell>
                    <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white hover:bg-gray-700"
                          onClick={() => viewSaleDetails(sale)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white hover:bg-gray-700"
                          onClick={() => printReceipt(sale)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sale Details Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ open, sale: null })}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda #{detailDialog.sale?.number}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {new Date(detailDialog.sale?.created_at).toLocaleString('pt-BR')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Cliente</p>
                <p className="text-white">{detailDialog.sale?.customer?.name || 'Consumidor final'}</p>
              </div>
              <div>
                <p className="text-gray-400">Funcionário</p>
                <p className="text-white">{detailDialog.sale?.user?.full_name}</p>
              </div>
              <div>
                <p className="text-gray-400">Forma de Pagamento</p>
                <p className="text-white">{getPaymentMethodLabel(detailDialog.sale?.payment_method)}</p>
              </div>
              <div>
                <p className="text-gray-400">Status</p>
                {getStatusBadge(detailDialog.sale?.status)}
              </div>
            </div>

            {detailDialog.sale?.payment_method === 'cash' && (
              <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-800">
                <div>
                  <p className="text-gray-400">Valor Recebido</p>
                  <p className="text-white">
                    {Number(detailDialog.sale.amount_received).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Troco</p>
                  <p className="text-green-400">
                    {Number(detailDialog.sale.change_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
            )}

            {detailDialog.sale?.command && (
              <div className="pt-4 border-t border-gray-800">
                <p className="text-gray-400 text-sm">Comanda</p>
                <p className="text-white">#{detailDialog.sale.command.number}</p>
                <p className="text-gray-400 text-sm">Vencimento: {new Date(detailDialog.sale.command.due_date).toLocaleDateString('pt-BR')}</p>
                <p className="text-white font-medium">
                  Saldo: {Number(detailDialog.sale.command.balance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-800">
              <p className="text-gray-400 text-sm mb-2">Itens</p>
              <div className="space-y-2">
                {saleItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm bg-gray-800 p-2 rounded">
                    <div>
                      <p className="text-white">{item.name}</p>
                      <p className="text-gray-500 text-xs">{item.quantity}x {item.unit_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                    <p className="text-white font-medium">
                      {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">
                  {Number(detailDialog.sale?.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Desconto</span>
                <span className="text-white">
                  -{Number(detailDialog.sale?.discount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span className="text-white">Total</span>
                <span className="text-red-500">
                  {Number(detailDialog.sale?.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
