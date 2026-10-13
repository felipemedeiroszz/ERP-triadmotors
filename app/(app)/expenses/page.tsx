import { requireAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/server'
import { Plus, TrendingDown, Search, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { ExpensesClient } from './client'

export default async function ExpensesPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Despesas</h1>
          <p className="text-gray-400 mt-1">Gestão de despesas e pagamentos</p>
        </div>
        <Link href="/expenses/new">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        </Link>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Histórico de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpensesClient initialExpenses={expenses || []} />
        </CardContent>
      </Card>
    </div>
  )
}
