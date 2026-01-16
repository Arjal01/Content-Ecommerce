'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard, Search, Package } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">PromoHub</span>
            </Link>
            <div className="hidden md:flex md:items-center md:gap-6">
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-primary">
                Articles
              </Link>
              <Link href="/companies" className="text-sm font-medium text-gray-700 hover:text-primary">
                Companies
              </Link>
              <Link href="/search" className="text-sm font-medium text-gray-700 hover:text-primary">
                <Search className="h-4 w-4 inline mr-1" />
                Search
              </Link>
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            {user ? (
              <>
                <Link href="/orders">
                  <Button variant="ghost" size="sm">
                    <Package className="mr-2 h-4 w-4" />
                    Orders
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  {user.email}
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
                Articles
              </Link>
              <Link href="/companies" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
                Companies
              </Link>
              <Link href="/search" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
                Search
              </Link>
              {user ? (
                <>
                  <Link href="/orders" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </Link>
                  )}
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <Button variant="ghost" size="sm" onClick={() => { logout(); setMenuOpen(false) }}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">Login</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    <Button size="sm" className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
