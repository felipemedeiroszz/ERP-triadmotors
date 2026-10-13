import { requireUser } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createClient } from '@/lib/supabase/server'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'
import Link from 'next/link'
import { ProductsClient } from './client'

export default async function ProductsPage() {
  const { profile } = await requireUser()
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      brand:brands(name),
      images:product_images(url, is_primary)
    `)
    .eq('active', true)
    .order('name')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('active', true)
    .order('name')

  const { data: brands } = await supabase
    .from('brands')
    .select('id, name')
    .eq('active', true)
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Produtos</h1>
          <p className="text-gray-400 mt-1">Gerencie seu catálogo de produtos</p>
        </div>
        {profile.role === 'admin' && (
          <Link href="/products/new">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </Link>
        )}
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductsClient
            initialProducts={products || []}
            categories={categories || []}
            brands={brands || []}
            isAdmin={profile.role === 'admin'}
          />
        </CardContent>
      </Card>
    </div>
  )
}
