import { requireUser } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/server'
import { Package, TrendingUp, TrendingDown, History } from 'lucide-react'
import { StockClient } from './client'

export default async function StockPage() {
  const { profile } = await requireUser()
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, sku, name, stock, min_stock, unit')
    .eq('active', true)
    .order('name')

  const { data: movements } = await supabase
    .from('stock_movements')
    .select(`
      *,
      product:products(name, sku),
      user:profiles(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Estoque</h1>
        <p className="text-gray-400 mt-1">Controle de movimentações e gestão de estoque</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{products?.length || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Estoque Baixo</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {products?.filter((p) => p.stock < p.min_stock).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Sem Estoque</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {products?.filter((p) => p.stock === 0).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <StockClient initialProducts={products || []} />
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="h-5 w-5" />
            Últimas Movimentações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Data</TableHead>
                <TableHead className="text-gray-400">Produto</TableHead>
                <TableHead className="text-gray-400">Tipo</TableHead>
                <TableHead className="text-gray-400">Quantidade</TableHead>
                <TableHead className="text-gray-400">Motivo</TableHead>
                <TableHead className="text-gray-400">Usuário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Nenhuma movimentação registrada
                  </TableCell>
                </TableRow>
              ) : (
                movements?.map((movement: any) => (
                  <TableRow key={movement.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="text-gray-400">
                      {new Date(movement.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-white">
                      {movement.product?.name}
                      <span className="text-xs text-gray-500 ml-2">({movement.product?.sku})</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          movement.type === 'in'
                            ? 'bg-green-600'
                            : movement.type === 'out'
                            ? 'bg-red-600'
                            : 'bg-blue-600'
                        }
                      >
                        {movement.type === 'in' ? 'Entrada' : movement.type === 'out' ? 'Saída' : 'Ajuste'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">{movement.quantity}</TableCell>
                    <TableCell className="text-gray-400">{movement.reason}</TableCell>
                    <TableCell className="text-gray-400">{movement.user?.full_name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
