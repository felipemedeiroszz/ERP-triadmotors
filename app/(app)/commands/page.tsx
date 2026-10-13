import { requireUser } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/server'
import { Receipt, Calendar as CalendarIcon, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react'
import { CommandsClient } from './client'

export default async function CommandsPage() {
  const { profile } = await requireUser()
  const supabase = await createClient()

  const { data: commands } = await supabase
    .from('commands')
    .select(`
      *,
      customer:customers(name, phone),
      sale:sales(number)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Comandas</h1>
        <p className="text-gray-400 mt-1">Gerencie contas a receber e pagamentos</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Todas as Comandas</CardTitle>
        </CardHeader>
        <CardContent>
          <CommandsClient initialCommands={commands || []} />
        </CardContent>
      </Card>
    </div>
  )
}
