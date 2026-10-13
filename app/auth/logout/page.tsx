import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default async function LogoutPage() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
