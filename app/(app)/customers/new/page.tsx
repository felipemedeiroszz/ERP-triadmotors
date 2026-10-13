import { requireUser } from '@/lib/auth'
import { CustomerForm } from '../customer-form'

export default async function NewCustomerPage() {
  const { profile } = await requireUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Novo Cliente</h1>
        <p className="text-gray-400 mt-1">Cadastre um novo cliente no sistema</p>
      </div>

      <CustomerForm />
    </div>
  )
}
