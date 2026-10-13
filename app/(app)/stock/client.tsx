'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Minus, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface StockClientProps {
  initialProducts: any[]
}

export function StockClient({ initialProducts }: StockClientProps) {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')
  const [adjustDialog, setAdjustDialog] = useState<{ open: boolean; product: any }>({ open: false, product: null })
  const [adjustQuantity, setAdjustQuantity] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [loading, setLoading] = useState(false)

  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && product.stock < product.min_stock) ||
      (stockFilter === 'out' && product.stock === 0)

    return matchesSearch && matchesStock
  })

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Sem estoque', color: 'bg-red-600' }
    if (stock < minStock) return { label: 'Baixo', color: 'bg-orange-600' }
    return { label: 'OK', color: 'bg-green-600' }
  }

  const handleAdjust = async () => {
    if (!adjustDialog.product) return

    const quantity = parseInt(adjustQuantity)
    if (!quantity || quantity === 0) {
      toast.error('Informe uma quantidade válida')
      return
    }

    if (!adjustReason.trim()) {
      toast.error('Informe o motivo do ajuste')
      return
    }

    setLoading(true)

    try {
      await supabase.rpc('update_product_stock', {
        p_product_id: adjustDialog.product.id,
        p_quantity: Math.abs(quantity),
        p_type: quantity > 0 ? 'in' : 'out',
        p_reason: adjustReason,
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
      })

      toast.success('Estoque ajustado com sucesso!')
      setAdjustDialog({ open: false, product: null })
      setAdjustQuantity('')
      setAdjustReason('')
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao ajustar estoque')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          <Select value={stockFilter} onValueChange={(value: any) => setStockFilter(value)}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="low">Estoque Baixo</SelectItem>
              <SelectItem value="out">Sem Estoque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border border-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">SKU</TableHead>
                <TableHead className="text-gray-400">Nome</TableHead>
                <TableHead className="text-gray-400">Estoque</TableHead>
                <TableHead className="text-gray-400">Mínimo</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.min_stock)

                  return (
                    <TableRow key={product.id} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell className="text-white font-mono text-sm">{product.sku}</TableCell>
                      <TableCell className="text-white">{product.name}</TableCell>
                      <TableCell className="text-white font-medium">{product.stock} {product.unit}</TableCell>
                      <TableCell className="text-gray-400">{product.min_stock}</TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAdjustDialog({ open: true, product })}
                          className="border-gray-700 text-white hover:bg-gray-700"
                        >
                          Ajustar
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={adjustDialog.open} onOpenChange={(open) => setAdjustDialog({ open, product: null })}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Ajustar Estoque</DialogTitle>
            <DialogDescription className="text-gray-400">
              {adjustDialog.product?.name} ({adjustDialog.product?.sku})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Quantidade (positivo para entrada, negativo para saída)</Label>
              <Input
                type="number"
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Ex: 10 ou -5"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Motivo</Label>
              <Input
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Ex: Ajuste de inventário, Devolução, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjustDialog({ open: false, product: null })}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button onClick={handleAdjust} className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
              {loading ? 'Processando...' : 'Confirmar Ajuste'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
