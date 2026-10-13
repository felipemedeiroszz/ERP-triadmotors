'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Profile } from '@/lib/types'

interface HeaderProps {
  profile: Profile
}

export function Header({ profile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur border-b border-gray-800">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search */}
        <div className="flex-1 max-w-md ml-16 lg:ml-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar produtos, clientes, vendas..."
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
