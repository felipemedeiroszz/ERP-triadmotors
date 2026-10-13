import { requireUser } from '@/lib/auth'
import { ProductForm } from '../product-form'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { profile } = await requireUser()
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      brand:brands(name),
      supplier:suppliers(name),
      images:product_images(id, url, is_primary, storage_path, position)
    `)
    .eq('id', params.id)
    .eq('active', true)
    .single()

  if (!product) {
    notFound()
  }

  if (profile.role !== 'admin') {
    notFound()
  }

  const [{ data: categories }, { data: brands }, { data: suppliers }] = await Promise.all([
    supabase.from('categories').select('id, name').eq('active', true).order('name'),
    supabase.from('brands').select('id, name').eq('active', true).order('name'),
    supabase.from('suppliers').select('id, name').eq('active', true).order('name'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Editar Produto</h1>
        <p className="text-gray-400 mt-1">Edite as informações do produto</p>
      </div>

      <ProductForm
        categories={categories || []}
        brands={brands || []}
        suppliers={suppliers || []}
        product={product}
      />
    </div>
  )
}
