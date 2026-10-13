import { requireUser } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { DollarSign, Lock, Unlock, AlertCircle } from 'lucide-react'
import { CashRegisterClient } from './client'

export default async function CashRegisterPage() {
  const { profile } = await requireUser()
  const supabase = await createClient()

  const { data: currentRegister } = await supabase
    .from('cash_registers')
    .select('*')
    .eq('status', 'open')
    .eq('opened_by', profile.id)
    .order('opened_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Caixa</h1>
        <p className="text-gray-400 mt-1">Controle de abertura e fechamento de caixa</p>
      </div>

      <CashRegisterClient currentRegister={currentRegister} userProfile={profile} />
    </div>
  )
}
