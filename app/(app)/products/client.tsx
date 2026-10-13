'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Edit, Trash2, Package, Image as ImageIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { ProductListItem } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ProductsClientProps {
  initialProducts: any[]
  categories: { id: string; name: string }[]
  brands: { id: string; name: string }[]
  isAdmin?: boolean
}

export function ProductsClient({ initialProducts, categories, brands, isAdmin = false }: ProductsClientProps) {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: any }>({ open: false, product: null })

  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory
    const matchesBrand = selectedBrand === 'all' || product.brand_id === selectedBrand

    return matchesSearch && matchesCategory && matchesBrand
  })

  const handleDelete = async () => {
    if (!deleteDialog.product) return

    try {
      const { error } = await supabase
        .from('products')
        .update({ active: false })
        .eq('id', deleteDialog.product.id)

      if (error) throw error

      toast.success('Produto inativado com sucesso!')
      setDeleteDialog({ open: false, product: null })
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao inativar produto')
    }
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Sem estoque', color: 'bg-red-600' }
    if (stock < minStock) return { label: 'Baixo', color: 'bg-orange-600' }
    return { label: 'OK', color: 'bg-green-600' }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por nome, SKU ou código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
          >
            <option value="all">Todas as marcas</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-md border border-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Imagem</TableHead>
                <TableHead className="text-gray-400">SKU</TableHead>
                <TableHead className="text-gray-400">Nome</TableHead>
                <TableHead className="text-gray-400">Categoria</TableHead>
                <TableHead className="text-gray-400">Marca</TableHead>
                <TableHead className="text-gray-400">Preço</TableHead>
                <TableHead className="text-gray-400">Estoque</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const primaryImage = product.images?.find((img: any) => img.is_primary)
                  const stockStatus = getStockStatus(product.stock, product.min_stock)

                  return (
                    <TableRow key={product.id} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell>
                        {primaryImage ? (
                          <img
                            src={primaryImage.url}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-white font-mono text-sm">{product.sku}</TableCell>
                      <TableCell className="text-white">{product.name}</TableCell>
                      <TableCell className="text-gray-400">{product.category?.name || '-'}</TableCell>
                      <TableCell className="text-gray-400">{product.brand?.name || '-'}</TableCell>
                      <TableCell className="text-white">
                        {Number(product.sale_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell className="text-white">{product.stock}</TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {isAdmin && (
                            <>
                              <Link href={`/products/${product.id}`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-red-400 hover:bg-gray-700"
                                onClick={() => setDeleteDialog({ open: true, product })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: null })}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja inativar o produto "{deleteDialog.product?.name}"? Esta ação pode ser revertida.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, product: null })}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Inativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
