import { requireUser } from '@/lib/auth'
import { PDVClient } from './client'
import { createClient } from '@/lib/supabase/server'

export default async function PDVPage() {
  const { profile } = await requireUser()
  const supabase = await createClient()

  const [{ data: customers }, { data: settings }] = await Promise.all([
    supabase.from('customers').select('id, name, phone').eq('active', true).order('name'),
    supabase.from('company_settings').select('*').eq('id', 1).single(),
  ])

  return (
    <div className="h-[calc(100vh-8rem)]">
      <PDVClient
        customers={customers || []}
        settings={settings}
        userProfile={profile}
      />
    </div>
  )
}
