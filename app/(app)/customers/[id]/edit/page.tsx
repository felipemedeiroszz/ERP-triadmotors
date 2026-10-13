import { requireUser } from '@/lib/auth'
import { CustomerForm } from '../../customer-form'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const { profile } = await requireUser()
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', params.id)
    .eq('active', true)
    .single()

  if (!customer) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Editar Cliente</h1>
        <p className="text-gray-400 mt-1">Edite as informações do cliente</p>
      </div>

      <CustomerForm customer={customer} />
    </div>
  )
}
