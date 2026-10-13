import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = await requireUser()

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar profile={profile} />
      <div className="lg:pl-64">
        <Header profile={profile} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
