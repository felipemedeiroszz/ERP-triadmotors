'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Edit, Trash2, CheckCircle, Clock, XCircle, Upload, Image as ImageIcon, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface ExpensesClientProps {
  initialExpenses: any[]
}

export function ExpensesClient({ initialExpenses }: ExpensesClientProps) {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [addDialog, setAddDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState('')

  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    due_date: '',
    payment_method: '',
    status: 'pending' as 'pending' | 'paid' | 'cancelled',
    recurrence: 'none' as 'none' | 'weekly' | 'monthly' | 'yearly',
    notes: '',
  })

  const predefinedCategories = [
    'Energia',
    'Água',
    'Limpeza',
    'Mercado',
    'Estacionamento',
    'Combustível',
  ]

  const categories = Array.from(new Set([...predefinedCategories, ...initialExpenses.map((e) => e.category)]))

  const filteredExpenses = initialExpenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter

    // Calculate effective status (including overdue)
    const isOverdue = expense.status === 'pending' && expense.due_date && new Date(expense.due_date) < new Date()
    const effectiveStatus = isOverdue ? 'overdue' : expense.status
    const matchesEffectiveStatus = statusFilter === 'all' || effectiveStatus === statusFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesEffectiveStatus
  })

  const getStatusBadge = (expense: any) => {
    const isOverdue = expense.status === 'pending' && expense.due_date && new Date(expense.due_date) < new Date()

    if (expense.status === 'paid') {
      return <Badge className="bg-green-600">Paga</Badge>
    }
    if (expense.status === 'cancelled') {
      return <Badge className="bg-gray-600">Cancelada</Badge>
    }
    if (isOverdue) {
      return <Badge className="bg-red-600">Vencida</Badge>
    }
    return <Badge className="bg-yellow-600">Pendente</Badge>
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `expense-receipts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('expense-receipts')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('expense-receipts')
        .getPublicUrl(filePath)

      setReceiptUrl(publicUrl)
      toast.success('Imagem carregada com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar imagem')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('expenses').insert({
        description: formData.description,
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: formData.date,
        due_date: formData.due_date || null,
        payment_method: formData.payment_method || null,
        status: formData.status,
        recurrence: formData.recurrence,
        notes: formData.notes || null,
        receipt_url: receiptUrl || null,
        paid_at: formData.status === 'paid' ? new Date().toISOString() : null,
      })

      if (error) throw error

      toast.success('Despesa cadastrada com sucesso!')
      setAddDialog(false)
      setFormData({
        description: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        due_date: '',
        payment_method: '',
        status: 'pending',
        recurrence: 'none',
        notes: '',
      })
      setReceiptUrl('')
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar despesa')
    } finally {
      setLoading(false)
    }
  }

  const markAsPaid = async (expense: any) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', expense.id)

      if (error) throw error

      toast.success('Despesa marcada como paga!')
      window.location.reload()
    } catch (error: any) {
      toast.error('Erro ao atualizar despesa')
    }
  }

  const deleteExpense = async (expense: any) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', expense.id)

      if (error) throw error

      toast.success('Despesa excluída com sucesso!')
      window.location.reload()
    } catch (error: any) {
      toast.error('Erro ao excluir despesa')
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por descrição ou categoria..."
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
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="paid">Pagas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full md:w-48">
              <SelectValue placeholder="Todas categorias" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">Todas Categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setAddDialog(true)} className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nova
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border border-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Descrição</TableHead>
                <TableHead className="text-gray-400">Categoria</TableHead>
                <TableHead className="text-gray-400">Data</TableHead>
                <TableHead className="text-gray-400">Vencimento</TableHead>
                <TableHead className="text-gray-400">Valor</TableHead>
                <TableHead className="text-gray-400">Nota</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    Nenhuma despesa encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="text-white">{expense.description}</TableCell>
                    <TableCell className="text-gray-400">{expense.category}</TableCell>
                    <TableCell className="text-gray-400">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(expense.date).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {expense.due_date ? new Date(expense.due_date).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {Number(expense.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {expense.receipt_url ? (
                        <a
                          href={expense.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                        >
                          <ImageIcon className="h-4 w-4" />
                          Ver
                        </a>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(expense)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {expense.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsPaid(expense)}
                            className="border-gray-700 text-white hover:bg-gray-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Pagar
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-400 hover:bg-gray-700"
                          onClick={() => deleteExpense(expense)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add Expense Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
            <DialogDescription className="text-gray-400">Cadastre uma nova despesa</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Descrição *</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {predefinedCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Valor *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Data *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Vencimento</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Forma de Pagamento</Label>
                  <Input
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Ex: PIX, Transferência"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Paga</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Recorrência</Label>
                  <Select
                    value={formData.recurrence}
                    onValueChange={(value: any) => setFormData({ ...formData, recurrence: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="none">Não recorrente</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Observações</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Imagem da Nota</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('receipt-upload')?.click()}
                    className="border-gray-700 text-white hover:bg-gray-800"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Anexar Imagem
                      </>
                    )}
                  </Button>
                  <input
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {receiptUrl && (
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Ver imagem
                    </a>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddDialog(false)}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
