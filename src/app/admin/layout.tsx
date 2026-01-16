'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import {
  LayoutDashboard,
  FileText,
  Building2,
  Package,
  BarChart3,
  LogOut,
  Home,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  Users,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
  { href: '/admin/companies', label: 'Companies', icon: Building2 },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: Users },
  { href: '/admin/payouts', label: 'Vendor Payouts', icon: Wallet },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <ProtectedRoute adminOnly>
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">PromoHub Admin</span>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn('w-full justify-start', isActive && 'bg-primary/10')}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4 space-y-2">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Back to Site
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>
        <main className="ml-64 flex-1 bg-gray-50">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
