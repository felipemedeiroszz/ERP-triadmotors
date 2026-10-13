'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { uploadProductImage } from '@/lib/supabase/storage'
import { Loader2, Save, X, Upload, Plus, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ProductFormProps {
  categories: { id: string; name: string }[]
  brands: { id: string; name: string }[]
  suppliers: { id: string; name: string }[]
  product?: any
}

export function ProductForm({ categories, brands, suppliers, product }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<any[]>(product?.images || [])
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    name: product?.name || '',
    description: product?.description || '',
    application: product?.application || '',
    unit: product?.unit || 'UN',
    cost_price: product?.cost_price || '',
    sale_price: product?.sale_price || '',
    stock: product?.stock || 0,
    min_stock: product?.min_stock || 5,
    category_id: product?.category_id || '',
    brand_id: product?.brand_id || '',
    supplier_id: product?.supplier_id || '',
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const productId = product?.id || crypto.randomUUID()

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const isPrimary = images.length === 0 && index === 0
        const result = await uploadProductImage(productId, file, isPrimary, images.length + index)

        // Save to database
        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            storage_path: result.path,
            url: result.url,
            is_primary,
            position: images.length + index,
          })
          .select()
          .single()

        if (imageError) throw imageError
        return imageData
      })

      const uploadedImages = await Promise.all(uploadPromises)
      setImages((prev) => [...prev, ...uploadedImages])
      toast.success('Imagens enviadas com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar imagens')
    } finally {
      setUploading(false)
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', product?.id)

      await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId)

      setImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === imageId }))
      )
      toast.success('Imagem principal definida!')
    } catch (error: any) {
      toast.error('Erro ao definir imagem principal')
    }
  }

  const handleDeleteImage = async (imageId: string, storagePath: string) => {
    try {
      await supabase.from('product_images').delete().eq('id', imageId)
      await supabase.storage.from('product-images').remove([storagePath])

      setImages((prev) => prev.filter((img) => img.id !== imageId))
      toast.success('Imagem removida com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao remover imagem')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if SKU already exists
      const { data: existingSku } = await supabase
        .from('products')
        .select('id')
        .eq('sku', formData.sku)
        .single()

      if (existingSku && existingSku.id !== product?.id) {
        throw new Error('SKU já cadastrado. Utilize outro código.')
      }

      const productData = {
        sku: formData.sku,
        barcode: formData.barcode || null,
        name: formData.name,
        description: formData.description || null,
        application: formData.application || null,
        unit: formData.unit,
        cost_price: parseFloat(formData.cost_price) || 0,
        sale_price: parseFloat(formData.sale_price) || 0,
        stock: parseInt(formData.stock) || 0,
        min_stock: parseInt(formData.min_stock) || 5,
        category_id: formData.category_id || null,
        brand_id: formData.brand_id || null,
        supplier_id: formData.supplier_id || null,
      }

      if (product) {
        // Update
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)

        if (error) throw error
        toast.success('Produto atualizado com sucesso!')
      } else {
        // Create
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (error) throw error

        // Update images with product ID
        if (images.length > 0) {
          await supabase
            .from('product_images')
            .update({ product_id: newProduct.id })
            .eq('product_id', crypto.randomUUID())
        }

        toast.success('Produto cadastrado com sucesso!')
      }

      router.push('/products')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-gray-300">Código/SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Ex: 00125"
                  />
                  <p className="text-xs text-gray-500">Código manual e único do produto</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode" className="text-gray-300">Código de Barras</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Ex: Pastilha de freio Honda CG 160"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="application" className="text-gray-300">Modelo/Aplicação</Label>
                <Input
                  id="application"
                  value={formData.application}
                  onChange={(e) => handleInputChange('application', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Ex: Honda CG 160 2017-2023"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-300">Categoria</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange('category_id', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-gray-300">Marca</Label>
                  <Select
                    value={formData.brand_id}
                    onValueChange={(value) => handleInputChange('brand_id', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier" className="text-gray-300">Fornecedor</Label>
                  <Select
                    value={formData.supplier_id}
                    onValueChange={(value) => handleInputChange('supplier_id', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {suppliers.map((sup) => (
                        <SelectItem key={sup.id} value={sup.id}>
                          {sup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="text-gray-300">Unidade</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleInputChange('unit', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="UN">Unidade (UN)</SelectItem>
                    <SelectItem value="KG">Quilograma (KG)</SelectItem>
                    <SelectItem value="L">Litro (L)</SelectItem>
                    <SelectItem value="M">Metro (M)</SelectItem>
                    <SelectItem value="CX">Caixa (CX)</SelectItem>
                    <SelectItem value="PCT">Pacote (PCT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Preços e Estoque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost_price" className="text-gray-300">Preço de Custo</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => handleInputChange('cost_price', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price" className="text-gray-300">Preço de Venda *</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => handleInputChange('sale_price', e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-gray-300">Estoque Atual</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_stock" className="text-gray-300">Estoque Mínimo</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => handleInputChange('min_stock', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Images */}
        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Imagens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <label htmlFor="images" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                  <p className="text-sm text-gray-400">
                    {uploading ? 'Enviando...' : 'Clique para enviar imagens'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP (máx 5MB)</p>
                </label>
              </div>

              {images.length > 0 && (
                <div className="space-y-2">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <Avatar className="w-full h-40 rounded-lg">
                        <AvatarImage src={image.url} alt="Product" className="object-cover" />
                        <AvatarFallback className="bg-gray-800">
                          <Plus className="h-8 w-8 text-gray-600" />
                        </AvatarFallback>
                      </Avatar>
                      {image.is_primary && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                          Principal
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        {!image.is_primary && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSetPrimary(image.id)}
                          >
                            Definir Principal
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteImage(image.id, image.storage_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
