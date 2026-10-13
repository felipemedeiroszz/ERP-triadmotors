import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { CompanySettings, Profile } from '@/lib/types'

export const getSession = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, profile: null as Profile | null }
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, active, created_at')
    .eq('id', user.id)
    .maybeSingle<Profile>()
  return { supabase, user, profile }
})

export async function requireUser() {
  const s = await getSession()
  if (!s.user) redirect('/auth/login')
  if (!s.profile || !s.profile.active) redirect('/auth/inactive')
  return s as typeof s & { profile: Profile }
}

export async function requireAdmin() {
  const s = await requireUser()
  if (s.profile.role !== 'admin') redirect('/?denied=1')
  return s
}

export const getSettings = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase.from('company_settings').select('*').eq('id', 1).maybeSingle<CompanySettings>()
  return data
})
