import { requireAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/server'
import { BarChart3, TrendingUp, Package, Users, DollarSign, Download } from 'lucide-react'
import { ReportsClient } from './client'

export default async function ReportsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: sales } = await supabase
    .from('sales')
    .select('total, payment_method, created_at')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  const { data: products } = await supabase
    .from('products')
    .select('id, name, stock, sale_price')
    .eq('active', true)

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name')
    .eq('active', true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Relatórios</h1>
        <p className="text-gray-400 mt-1">Relatórios administrativos e análises</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Gerar Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportsClient
            sales={sales || []}
            products={products || []}
            customers={customers || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
