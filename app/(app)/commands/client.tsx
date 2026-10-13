'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Receipt, Calendar as CalendarIcon, DollarSign, CheckCircle, Clock, XCircle, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface CommandsClientProps {
  initialCommands: any[]
}

export function CommandsClient({ initialCommands }: CommandsClientProps) {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'paid' | 'cancelled'>('all')
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; command: any }>({ open: false, command: null })
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'pix' | 'debit' | 'credit'>('cash')
  const [loading, setLoading] = useState(false)

  const filteredCommands = initialCommands.filter((command) => {
    const matchesSearch =
      command.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.number.toString().includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || command.status === statusFilter

    // Calculate effective status (including overdue)
    const isOverdue = command.status === 'open' && new Date(command.due_date) < new Date()
    const effectiveStatus = isOverdue ? 'overdue' : command.status

    const matchesEffectiveStatus = statusFilter === 'all' || effectiveStatus === statusFilter

    return matchesSearch && matchesStatus && matchesEffectiveStatus
  })

  const getStatusBadge = (command: any) => {
    const isOverdue = command.status === 'open' && new Date(command.due_date) < new Date()

    if (command.status === 'paid') {
      return <Badge className="bg-green-600">Paga</Badge>
    }
    if (command.status === 'cancelled') {
      return <Badge className="bg-gray-600">Cancelada</Badge>
    }
    if (isOverdue) {
      return <Badge className="bg-red-600">Vencida</Badge>
    }
    return <Badge className="bg-yellow-600">Aberta</Badge>
  }

  const handlePayment = async () => {
    if (!paymentDialog.command) return

    const amount = parseFloat(paymentAmount)
    if (!amount || amount <= 0) {
      toast.error('Informe um valor válido')
      return
    }

    if (amount > paymentDialog.command.balance) {
      toast.error('Valor maior que o saldo devedor')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('command_payments').insert({
        command_id: paymentDialog.command.id,
        amount,
        method: paymentMethod,
      })

      if (error) throw error

      toast.success('Pagamento registrado com sucesso!')
      setPaymentDialog({ open: false, command: null })
      setPaymentAmount('')
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar pagamento')
    } finally {
      setLoading(false)
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
              placeholder="Buscar por cliente ou número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="open">Abertas</SelectItem>
              <SelectItem value="paid">Pagas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border border-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Número</TableHead>
                <TableHead className="text-gray-400">Cliente</TableHead>
                <TableHead className="text-gray-400">Venda</TableHead>
                <TableHead className="text-gray-400">Vencimento</TableHead>
                <TableHead className="text-gray-400">Total</TableHead>
                <TableHead className="text-gray-400">Pago</TableHead>
                <TableHead className="text-gray-400">Saldo</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                    Nenhuma comanda encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredCommands.map((command) => (
                  <TableRow key={command.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="text-white font-mono">#{command.number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-white">{command.customer?.name}</p>
                        {command.customer?.phone && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {command.customer.phone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">#{command.sale?.number}</TableCell>
                    <TableCell className="text-gray-400">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(command.due_date).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      {Number(command.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-green-400">
                      {Number(command.paid_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {Number(command.balance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell>{getStatusBadge(command)}</TableCell>
                    <TableCell className="text-right">
                      {command.status === 'open' && (
                        <Button
                          size="sm"
                          onClick={() => setPaymentDialog({ open: true, command })}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Pagar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog.open} onOpenChange={(open) => setPaymentDialog({ open, command: null })}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription className="text-gray-400">
              Comanda #{paymentDialog.command?.number} - {paymentDialog.command?.customer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total</span>
              <span className="text-white">
                {paymentDialog.command?.total && Number(paymentDialog.command.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Já pago</span>
              <span className="text-green-400">
                {paymentDialog.command?.paid_amount && Number(paymentDialog.command.paid_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-white">Saldo devedor</span>
              <span className="text-red-500">
                {paymentDialog.command?.balance && Number(paymentDialog.command.balance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="space-y-2 pt-4 border-t border-gray-800">
              <Label className="text-gray-300">Valor do Pagamento</Label>
              <Input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="debit">Débito</SelectItem>
                  <SelectItem value="credit">Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialog({ open: false, command: null })}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button onClick={handlePayment} className="bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
              {loading ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
