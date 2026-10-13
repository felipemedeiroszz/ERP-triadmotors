import { requireAdmin } from '@/lib/auth'
import { ProductForm } from '../product-form'
import { createClient } from '@/lib/supabase/server'

export default async function NewProductPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [{ data: categories }, { data: brands }, { data: suppliers }] = await Promise.all([
    supabase.from('categories').select('id, name').eq('active', true).order('name'),
    supabase.from('brands').select('id, name').eq('active', true).order('name'),
    supabase.from('suppliers').select('id, name').eq('active', true).order('name'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Novo Produto</h1>
        <p className="text-gray-400 mt-1">Cadastre um novo produto no sistema</p>
      </div>

      <ProductForm
        categories={categories || []}
        brands={brands || []}
        suppliers={suppliers || []}
      />
    </div>
  )
}
