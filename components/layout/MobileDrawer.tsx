'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, X } from 'lucide-react'
import { signOut } from 'next-auth/react'
import type { Role } from '@prisma/client'

const NAV_ITEMS = [
  { num: '01', label: 'DASHBOARD', href: '/dashboard' },
  { num: '02', label: 'EVENTS',    href: '/dashboard/events' },
  { num: '03', label: 'GUESTS',    href: '/dashboard/guests' },
  { num: '04', label: 'VENDORS',   href: '/dashboard/vendors' },
  { num: '05', label: 'BUDGET',    href: '/dashboard/budget' },
  { num: '06', label: 'ADMIN',     href: '/dashboard/admin', adminOnly: true },
]

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  userEmail?: string
  userRole?: Role
}

export function MobileDrawer({ open, onClose, userEmail, userRole }: MobileDrawerProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (open) onClose()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || userRole === 'SUPER_ADMIN'
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        className="absolute inset-y-0 left-0 w-64 flex flex-col"
        style={{ backgroundColor: '#111010' }}
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 h-12"
          style={{ borderBottom: '1px solid #1F1E1E' }}
        >
          <span
            className="text-xs tracking-[0.25em] uppercase"
            style={{ fontFamily: 'Courier New, monospace', color: '#C4BDB7' }}
          >
            EVENTFLOW
          </span>
          <button
            onClick={onClose}
            className="p-1 transition-interactive"
            style={{ color: '#6B6560' }}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 px-5 py-5 overflow-y-auto no-scrollbar space-y-0.5">
          {visibleItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-2 py-3 transition-interactive"
                style={{ color: isActive ? '#FAF8F5' : '#6B6560' }}
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  className="text-xs tabular-nums shrink-0"
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
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-4" style={{ borderTop: '1px solid #1F1E1E' }}>
          {userEmail && (
            <p
              className="px-2 py-2 text-xs truncate mb-2"
              style={{ fontFamily: 'Courier New, monospace', color: '#6B6560' }}
            >
              {userEmail}
            </p>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-4 w-full px-2 py-3 transition-interactive"
            style={{ color: '#3A3937' }}
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
      </nav>
    </div>
  )
}
