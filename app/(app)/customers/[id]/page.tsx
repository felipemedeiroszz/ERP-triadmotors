import { requireUser } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { Phone, Mail, MapPin, Edit, Receipt, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CustomerPage({ params }: { params: { id: string } }) {
  const { profile } = await requireUser()
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from('customers')
    .select(`
      *,
      commands_count:commands(count),
      open_commands:commands(count),
      paid_commands:commands(count)
    `)
    .eq('id', params.id)
    .eq('active', true)
    .single()

  if (!customer) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/customers">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{customer.name}</h1>
            <p className="text-gray-400 mt-1">{customer.document || 'Sem documento cadastrado'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/customers/${customer.id}/edit`}>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Link href={`/customers/${customer.id}/commands`}>
            <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
              <Receipt className="mr-2 h-4 w-4" />
              Comandas
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customer.phone && (
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="h-4 w-4 text-gray-500" />
                {customer.phone}
              </div>
            )}
            {customer.whatsapp && (
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="h-4 w-4 text-gray-500" />
                WhatsApp: {customer.whatsapp}
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="h-4 w-4 text-gray-500" />
                {customer.email}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customer.address && (
              <div className="flex items-start gap-2 text-gray-300">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p>{customer.address}{customer.address_number && `, ${customer.address_number}`}</p>
                  {customer.district && <p className="text-sm">{customer.district}</p>}
                  <p className="text-sm">{customer.city}{customer.state && ` - ${customer.state}`}</p>
                  {customer.zip && <p className="text-sm">CEP: {customer.zip}</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Limite de Crédito</span>
              <span className="text-white font-medium">
                {Number(customer.credit_limit).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Comandas</span>
              <Badge variant="outline" className="border-gray-700 text-gray-300">
                {customer.commands_count || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {customer.notes && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{customer.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
