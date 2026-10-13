import { requireUser } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createClient } from '@/lib/supabase/server'
import { Plus, Search, Phone, Mail, DollarSign, Receipt } from 'lucide-react'
import Link from 'next/link'
import { CustomersClient } from './client'

export default async function CustomersPage() {
  const { profile } = await requireUser()
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('customers')
    .select(`
      *,
      commands_count:commands(count),
      open_commands:commands(count),
      paid_commands:commands(count),
      overdue_commands:commands(count)
    `)
    .eq('active', true)
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Clientes</h1>
          <p className="text-gray-400 mt-1">Gerencie seus clientes e suas comandas</p>
        </div>
        {(profile.role === 'admin' || true) && (
          <Link href="/customers/new">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </Link>
        )}
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomersClient initialCustomers={customers || []} />
        </CardContent>
      </Card>
    </div>
  )
}
