'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, X } from 'lucide-react'

interface CustomerFormProps {
  customer?: any
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: customer?.name || '',
    document: customer?.document || '',
    phone: customer?.phone || '',
    whatsapp: customer?.whatsapp || '',
    email: customer?.email || '',
    address: customer?.address || '',
    address_number: customer?.address_number || '',
    district: customer?.district || '',
    city: customer?.city || '',
    state: customer?.state || '',
    zip: customer?.zip || '',
    notes: customer?.notes || '',
    credit_limit: customer?.credit_limit || 0,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if document already exists
      if (formData.document) {
        const { data: existingDocument } = await supabase
          .from('customers')
          .select('id')
          .eq('document', formData.document)
          .single()

        if (existingDocument && existingDocument.id !== customer?.id) {
          throw new Error('CPF/CNPJ já cadastrado para outro cliente.')
        }
      }

      const customerData = {
        name: formData.name,
        document: formData.document || null,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        address: formData.address || null,
        address_number: formData.address_number || null,
        district: formData.district || null,
        city: formData.city || null,
        state: formData.state || null,
        zip: formData.zip || null,
        notes: formData.notes || null,
        credit_limit: parseFloat(formData.credit_limit) || 0,
      }

      if (customer) {
        // Update
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', customer.id)

        if (error) throw error
        toast.success('Cliente atualizado com sucesso!')
      } else {
        // Create
        const { error } = await supabase
          .from('customers')
          .insert(customerData)

        if (error) throw error
        toast.success('Cliente cadastrado com sucesso!')
      }

      router.push('/customers')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document" className="text-gray-300">CPF/CNPJ</Label>
                  <Input
                    id="document"
                    value={formData.document}
                    onChange={(e) => handleInputChange('document', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Ex: (11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-gray-300">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Ex: (11) 99999-9999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Ex: cliente@email.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="text-gray-300">Rua</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Ex: Rua das Flores"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_number" className="text-gray-300">Número</Label>
                  <Input
                    id="address_number"
                    value={formData.address_number}
                    onChange={(e) => handleInputChange('address_number', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Ex: 123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-gray-300">Bairro</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Ex: Centro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-300">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Ex: São Paulo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-gray-300">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Ex: SP"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip" className="text-gray-300">CEP</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Ex: 01234-567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Configurações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="credit_limit" className="text-gray-300">Limite de Crédito</Label>
                <Input
                  id="credit_limit"
                  type="number"
                  step="0.01"
                  value={formData.credit_limit}
                  onChange={(e) => handleInputChange('credit_limit', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500">Valor máximo que o cliente pode ter em comandas em aberto</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-300">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={3}
                  placeholder="Observações adicionais sobre o cliente..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
    </form>
  )
}
