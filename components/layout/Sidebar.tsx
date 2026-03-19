'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import type { Role } from '@prisma/client'

interface NavItem {
  num: string
  label: string
  href: string
  roles?: Role[]
}

const NAV_ITEMS: NavItem[] = [
  { num: '01', label: 'DASHBOARD', href: '/dashboard' },
  { num: '02', label: 'EVENTS',    href: '/dashboard/events' },
  { num: '03', label: 'GUESTS',    href: '/dashboard/guests' },
  { num: '04', label: 'VENDORS',   href: '/dashboard/vendors' },
  { num: '05', label: 'BUDGET',    href: '/dashboard/budget' },
  { num: '06', label: 'ADMIN',     href: '/dashboard/admin', roles: ['SUPER_ADMIN'] },
]

interface SidebarProps {
  userEmail?: string | null
  userRole?: Role
}

export function Sidebar({ userEmail, userRole }: SidebarProps) {
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  )

  const displayEmail = userEmail ?? ''
  const displayRole = userRole?.replace('_', ' ') ?? ''

  return (
    <aside
      className="hidden lg:flex flex-col w-52 xl:w-60 shrink-0 h-screen sticky top-0"
      style={{ backgroundColor: '#111010', borderRight: '1px solid #1F1E1E' }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-7 h-14"
        style={{ borderBottom: '1px solid #1F1E1E' }}
      >
        <span
          className="text-xs tracking-[0.3em] uppercase"
          style={{ fontFamily: 'Courier New, monospace', color: '#C4BDB7' }}
        >
          EVENTFLOW
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-5 py-6 overflow-y-auto no-scrollbar" aria-label="Main navigation">
        <div className="space-y-0.5">
          {visibleItems.map((item, i) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)

            return (
              <div key={item.href}>
                {i > 0 && i % 3 === 0 && (
                  <hr className="my-3" style={{ borderColor: '#1F1E1E' }} />
                )}
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-4 px-2 py-2.5 transition-interactive group'
                  )}
                  style={{
                    color: isActive ? '#FAF8F5' : '#6B6560',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#C4BDB7'
                      ;(e.currentTarget as HTMLElement).style.backgroundColor = '#1A1919'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#6B6560'
                      ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span
                    className="text-xs shrink-0 tabular-nums"
                    style={{
                      fontFamily: 'Courier New, monospace',
                      color: isActive ? '#B8956A' : '#3A3937',
                    }}
                  >
                    {item.num}
                  </span>
                  <span
                    className="text-xs tracking-[0.18em]"
                    style={{ fontFamily: 'Courier New, monospace' }}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span
                      className="ml-auto text-xs"
                      style={{ color: '#B8956A', fontFamily: 'Courier New, monospace' }}
                    >
                      —
                    </span>
                  )}
                </Link>
              </div>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 pb-6 pt-4" style={{ borderTop: '1px solid #1F1E1E' }}>
        {/* User info */}
        <div className="px-2 py-3 mb-3">
          <p
            className="text-xs truncate"
            style={{ fontFamily: 'Courier New, monospace', color: '#6B6560' }}
          >
            {displayEmail}
          </p>
          {displayRole && (
            <p
              className="text-xs mt-1 tracking-[0.12em] uppercase"
              style={{ fontFamily: 'Courier New, monospace', color: '#3A3937' }}
            >
              {displayRole}
            </p>
          )}
        </div>

        <hr className="mb-3" style={{ borderColor: '#1F1E1E' }} />

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-4 w-full px-2 py-2.5 transition-interactive"
          style={{ color: '#3A3937' }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.color = '#9E3D3D'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.color = '#3A3937'
          }}
          aria-label="Sign out"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span
            className="text-xs tracking-[0.18em]"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            SIGN OUT
          </span>
        </button>
      </div>
    </aside>
  )
}
