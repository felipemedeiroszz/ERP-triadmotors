'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DollarSign, Lock, Unlock, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface CashRegisterClientProps {
  currentRegister: any
  userProfile: Profile
}

export function CashRegisterClient({ currentRegister, userProfile }: CashRegisterClientProps) {
  const supabase = createClient()
  const [openDialog, setOpenDialog] = useState(false)
  const [closeDialog, setCloseDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openingAmount, setOpeningAmount] = useState('')
  const [closingAmount, setClosingAmount] = useState('')
  const [movements, setMovements] = useState<any[]>([])

  const isOpen = currentRegister && currentRegister.status === 'open'

  const handleOpenRegister = async () => {
    const amount = parseFloat(openingAmount)
    if (isNaN(amount) || amount < 0) {
      toast.error('Informe um valor válido')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('cash_registers').insert({
        opened_by: userProfile.id,
        opening_amount: amount,
        status: 'open',
      })

      if (error) throw error

      toast.success('Caixa aberto com sucesso!')
      setOpenDialog(false)
      setOpeningAmount('')
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao abrir caixa')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseRegister = async () => {
    const amount = parseFloat(closingAmount)
    if (isNaN(amount) || amount < 0) {
      toast.error('Informe um valor válido')
      return
    }

    setLoading(true)

    try {
      // Calculate summary
      const { data: salesData } = await supabase
        .from('sales')
        .select('total, payment_method')
        .gte('created_at', currentRegister.opened_at)
        .eq('status', 'completed')

      const { data: receiptsData } = await supabase
        .from('command_payments')
        .select('amount, method')
        .gte('created_at', currentRegister.opened_at)

      const { data: cashMovementsData } = await supabase
        .from('cash_movements')
        .select('amount, type')
        .eq('cash_register_id', currentRegister.id)

      // Calculate totals
      const cashSales = salesData?.filter((s) => s.payment_method === 'cash').reduce((sum, s) => sum + Number(s.total), 0) || 0
      const pixSales = salesData?.filter((s) => s.payment_method === 'pix').reduce((sum, s) => sum + Number(s.total), 0) || 0
      const debitSales = salesData?.filter((s) => s.payment_method === 'debit').reduce((sum, s) => sum + Number(s.total), 0) || 0
      const creditSales = salesData?.filter((s) => s.payment_method === 'credit').reduce((sum, s) => sum + Number(s.total), 0) || 0
      const creditTermSales = salesData?.filter((s) => s.payment_method === 'credit_term').reduce((sum, s) => sum + Number(s.total), 0) || 0

      const receiptsCash = receiptsData?.filter((r) => r.method === 'cash').reduce((sum, r) => sum + Number(r.amount), 0) || 0
      const receiptsOther = receiptsData?.filter((r) => r.method !== 'cash').reduce((sum, r) => sum + Number(r.amount), 0) || 0

      const supply = cashMovementsData?.filter((m) => m.type === 'supply').reduce((sum, m) => sum + Number(m.amount), 0) || 0
      const withdrawal = cashMovementsData?.filter((m) => m.type === 'withdrawal').reduce((sum, m) => sum + Number(m.amount), 0) || 0

      const expectedCash = currentRegister.opening_amount + cashSales + receiptsCash + supply - withdrawal
      const difference = amount - expectedCash

      const summary = {
        opening_amount: currentRegister.opening_amount,
        cash: cashSales,
        pix: pixSales,
        debit: debitSales,
        credit: creditSales,
        credit_term: creditTermSales,
        receipts_cash: receiptsCash,
        receipts_other: receiptsOther,
        supply,
        withdrawal,
        total_sold: salesData?.reduce((sum, s) => sum + Number(s.total), 0) || 0,
        expected_cash,
        sales_count: salesData?.length || 0,
      }

      const { error } = await supabase
        .from('cash_registers')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          closed_by: userProfile.id,
          informed_amount: amount,
          expected_cash,
          difference,
          summary,
        })
        .eq('id', currentRegister.id)

      if (error) throw error

      toast.success('Caixa fechado com sucesso!')
      setCloseDialog(false)
      setClosingAmount('')
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fechar caixa')
    } finally {
      setLoading(false)
    }
  }

  const loadMovements = async () => {
    if (!currentRegister) return

    try {
      const { data } = await supabase
        .from('cash_movements')
        .select(`
          *,
          user:profiles(full_name)
        `)
        .eq('cash_register_id', currentRegister.id)
        .order('created_at', { ascending: false })

      setMovements(data || [])
    } catch (error) {
      console.error('Error loading movements:', error)
    }
  }

  const addMovement = async (type: 'supply' | 'withdrawal', amount: number, description: string) => {
    if (!currentRegister) return

    try {
      const { error } = await supabase.from('cash_movements').insert({
        cash_register_id: currentRegister.id,
        type,
        amount,
        description,
        user_id: userProfile.id,
      })

      if (error) throw error

      toast.success('Movimentação registrada!')
      loadMovements()
    } catch (error: any) {
      toast.error('Erro ao registrar movimentação')
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={`border-2 ${isOpen ? 'border-green-600' : 'border-gray-800'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isOpen ? (
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Unlock className="h-6 w-6 text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  <Lock className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isOpen ? 'Caixa Aberto' : 'Caixa Fechado'}
                </h2>
                {isOpen && currentRegister && (
                  <p className="text-gray-400 text-sm">
                    Aberto às {new Date(currentRegister.opened_at).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={() => (isOpen ? setCloseDialog(true) : setOpenDialog(true))}
              className={isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isOpen ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Fechar Caixa
                </>
              ) : (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Abrir Caixa
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isOpen && (
        <>
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Suprimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Valor</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Descrição</Label>
                  <Input
                    placeholder="Motivo do suprimento"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Registrar Suprimento
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Sangria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Valor</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Descrição</Label>
                  <Input
                    placeholder="Motivo da sangria"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Registrar Sangria
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Movements */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              {movements.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma movimentação registrada</p>
              ) : (
                <div className="space-y-2">
                  {movements.map((movement) => (
                    <div key={movement.id} className="flex justify-between items-center bg-gray-800 p-3 rounded">
                      <div>
                        <p className="text-white">{movement.description || movement.type}</p>
                        <p className="text-xs text-gray-500">
                          {movement.user?.full_name} • {new Date(movement.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <span className={`font-medium ${movement.type === 'supply' ? 'text-green-400' : 'text-red-400'}`}>
                        {movement.type === 'supply' ? '+' : '-'}
                        {Number(movement.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Open Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Abrir Caixa</DialogTitle>
            <DialogDescription className="text-gray-400">
              Informe o valor inicial do caixa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Valor Inicial</Label>
              <Input
                type="number"
                step="0.01"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button onClick={handleOpenRegister} className="bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
              {loading ? 'Processando...' : 'Abrir Caixa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Dialog */}
      <Dialog open={closeDialog} onOpenChange={setCloseDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Fechar Caixa</DialogTitle>
            <DialogDescription className="text-gray-400">
              Informe o valor em dinheiro em caixa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Valor Informado</Label>
              <Input
                type="number"
                step="0.01"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="0.00"
              />
            </div>
            <div className="bg-gray-800 p-4 rounded">
              <p className="text-sm text-gray-400">
                Valor de abertura: {currentRegister?.opening_amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCloseDialog(false)}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button onClick={handleCloseRegister} className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
              {loading ? 'Processando...' : 'Fechar Caixa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
