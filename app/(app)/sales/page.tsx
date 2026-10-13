import { requireUser } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/server'
import { Receipt, Calendar as CalendarIcon, Filter } from 'lucide-react'
import { SalesClient } from './client'

export default async function SalesPage() {
  const { profile } = await requireUser()
  const supabase = await createClient()

  const { data: sales } = await supabase
    .from('sales')
    .select(`
      *,
      customer:customers(name),
      user:profiles(full_name),
      command:commands(number, due_date, balance)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Vendas</h1>
        <p className="text-gray-400 mt-1">Histórico completo de vendas</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesClient initialSales={sales || []} userProfile={profile} />
        </CardContent>
      </Card>
    </div>
  )
}
