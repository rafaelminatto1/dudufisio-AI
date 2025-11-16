'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Users,
  Calendar,
  Activity,
  DollarSign,
  BookOpen,
  LayoutDashboard,
  Settings,
} from 'lucide-react'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Pacientes',
    href: '/dashboard/pacientes',
    icon: Users,
  },
  {
    title: 'Agenda',
    href: '/dashboard/agenda',
    icon: Calendar,
  },
  {
    title: 'Tratamentos',
    href: '/dashboard/tratamentos',
    icon: Activity,
  },
  {
    title: 'Financeiro',
    href: '/dashboard/financeiro',
    icon: DollarSign,
  },
  {
    title: 'Biblioteca',
    href: '/dashboard/biblioteca',
    icon: BookOpen,
  },
  {
    title: 'Configurações',
    href: '/dashboard/configuracoes',
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="hidden w-64 border-r bg-card lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">FisioFlow</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

