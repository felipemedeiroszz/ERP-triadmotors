'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { type Profile } from '@/lib/types'
import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  Users,
  Package,
  Warehouse,
  DollarSign,
  TrendingDown,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useState } from 'react'

interface SidebarProps {
  profile: Profile
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/', adminOnly: false },
  { icon: ShoppingBag, label: 'PDV', href: '/pdv', adminOnly: false },
  { icon: Receipt, label: 'Vendas', href: '/sales', adminOnly: false },
  { icon: Receipt, label: 'Comandas', href: '/commands', adminOnly: false },
  { icon: Users, label: 'Clientes', href: '/customers', adminOnly: false },
  { icon: Package, label: 'Produtos', href: '/products', adminOnly: false },
  { icon: Warehouse, label: 'Estoque', href: '/stock', adminOnly: false },
  { icon: DollarSign, label: 'Financeiro', href: '/financial', adminOnly: true },
  { icon: TrendingDown, label: 'Despesas', href: '/expenses', adminOnly: true },
  { icon: BarChart3, label: 'Relatórios', href: '/reports', adminOnly: true },
  { icon: UserCog, label: 'Usuários', href: '/users', adminOnly: true },
  { icon: Settings, label: 'Configurações', href: '/settings', adminOnly: true },
]

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || profile.role === 'admin'
  )

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logout realizado com sucesso!')
      window.location.href = '/auth/login'
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 z-40',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <img
                src="/brand/logo-triad.png"
                alt="TRIAD MOTO PARTS"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-white font-bold text-lg">TRIAD MOTO</h1>
                <p className="text-gray-500 text-xs">PARTS</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {profile.full_name}
                </p>
                <p className="text-gray-500 text-xs capitalize">
                  {profile.role === 'admin' ? 'Administrador' : 'Funcionário'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
