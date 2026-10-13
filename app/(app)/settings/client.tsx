'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Save, Building2, Phone, Mail, MapPin, DollarSign } from 'lucide-react'
import type { CompanySettings } from '@/lib/types'

interface SettingsClientProps {
  initialSettings: CompanySettings | null
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: initialSettings?.name || 'TRIAD MOTO PARTS',
    slogan: initialSettings?.slogan || 'Mais controle para o seu negócio.',
    cnpj: initialSettings?.cnpj || '',
    phone: initialSettings?.phone || '',
    whatsapp: initialSettings?.whatsapp || '',
    email: initialSettings?.email || '',
    address: initialSettings?.address || '',
    city: initialSettings?.city || '',
    state: initialSettings?.state || '',
    zip: initialSettings?.zip || '',
    receipt_footer: initialSettings?.receipt_footer || 'COMPROVANTE DE VENDA — NÃO É DOCUMENTO FISCAL',
    receipt_format: initialSettings?.receipt_format || '80',
    allow_negative_stock: initialSettings?.allow_negative_stock || false,
    default_min_stock: initialSettings?.default_min_stock || 5,
    employee_max_discount_pct: initialSettings?.employee_max_discount_pct || 10,
    employee_can_create_customers: initialSettings?.employee_can_create_customers || true,
    max_image_mb: initialSettings?.max_image_mb || 5,
    default_due_days: initialSettings?.default_due_days || 30,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('company_settings')
        .update({
          name: formData.name,
          slogan: formData.slogan,
          cnpj: formData.cnpj || null,
          phone: formData.phone || null,
          whatsapp: formData.whatsapp || null,
          email: formData.email || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          zip: formData.zip || null,
          receipt_footer: formData.receipt_footer,
          receipt_format: formData.receipt_format,
          allow_negative_stock: formData.allow_negative_stock,
          default_min_stock: formData.default_min_stock,
          employee_max_discount_pct: formData.employee_max_discount_pct,
          employee_can_create_customers: formData.employee_can_create_customers,
          max_image_mb: formData.max_image_mb,
          default_due_days: formData.default_due_days,
        })
        .eq('id', 1)

      if (error) throw error

      toast.success('Configurações salvas com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Nome da Empresa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slogan" className="text-gray-300">Slogan</Label>
              <Input
                id="slogan"
                value={formData.slogan}
                onChange={(e) => handleInputChange('slogan', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-gray-300">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="(00) 0000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-gray-300">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="(00) 00000-0000"
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-300">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-300">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-gray-300">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
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
                  placeholder="00000-000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Configurações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receipt_footer" className="text-gray-300">Rodapé do Comprovante</Label>
              <Textarea
                id="receipt_footer"
                value={formData.receipt_footer}
                onChange={(e) => handleInputChange('receipt_footer', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt_format" className="text-gray-300">Formato do Comprovante</Label>
              <Select
                value={formData.receipt_format}
                onValueChange={(value) => handleInputChange('receipt_format', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="58">58mm (Térmica Pequena)</SelectItem>
                  <SelectItem value="80">80mm (Térmica Padrão)</SelectItem>
                  <SelectItem value="a4">A4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_min_stock" className="text-gray-300">Estoque Mínimo Padrão</Label>
              <Input
                id="default_min_stock"
                type="number"
                value={formData.default_min_stock}
                onChange={(e) => handleInputChange('default_min_stock', parseInt(e.target.value))}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_max_discount_pct" className="text-gray-300">Desconto Máximo Funcionário (%)</Label>
              <Input
                id="employee_max_discount_pct"
                type="number"
                step="0.01"
                value={formData.employee_max_discount_pct}
                onChange={(e) => handleInputChange('employee_max_discount_pct', parseFloat(e.target.value))}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_due_days" className="text-gray-300">Dias de Vencimento Padrão</Label>
              <Input
                id="default_due_days"
                type="number"
                value={formData.default_due_days}
                onChange={(e) => handleInputChange('default_due_days', parseInt(e.target.value))}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_image_mb" className="text-gray-300">Tamanho Máximo de Imagens (MB)</Label>
              <Input
                id="max_image_mb"
                type="number"
                value={formData.max_image_mb}
                onChange={(e) => handleInputChange('max_image_mb', parseInt(e.target.value))}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <Label htmlFor="allow_negative_stock" className="text-gray-300">Permitir Estoque Negativo</Label>
                <input
                  id="allow_negative_stock"
                  type="checkbox"
                  checked={formData.allow_negative_stock}
                  onChange={(e) => handleInputChange('allow_negative_stock', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="employee_can_create_customers" className="text-gray-300">Funcionário Pode Criar Clientes</Label>
                <input
                  id="employee_can_create_customers"
                  type="checkbox"
                  checked={formData.employee_can_create_customers}
                  onChange={(e) => handleInputChange('employee_can_create_customers', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={loading}
        >
          {loading ? (
            'Salvando...'
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
