'use client'

import { useState } from 'react'
import { Menu, Bell } from 'lucide-react'
import { MobileDrawer } from './MobileDrawer'
import { initials } from '@/lib/utils'
import type { Role } from '@prisma/client'
import { usePathname } from 'next/navigation'

interface TopBarProps {
  title?: string
  userEmail?: string | null
  userName?: string | null
  userRole?: Role
}

const PATH_LABELS: Record<string, string> = {
  '/dashboard':          'DASHBOARD',
  '/dashboard/events':   'EVENTS',
  '/dashboard/guests':   'GUESTS',
  '/dashboard/vendors':  'VENDORS',
  '/dashboard/budget':   'BUDGET',
  '/dashboard/admin':    'ADMIN',
}

export function TopBar({ title, userEmail, userName, userRole }: TopBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  const displayName = userName ?? userEmail?.split('@')[0] ?? 'User'
  const avatarInitials = initials(displayName)

  // Build breadcrumb from path
  const pathLabel = PATH_LABELS[pathname] ?? title?.toUpperCase() ?? 'EVENTFLOW'

  return (
    <>
      <header
        className="sticky top-0 z-30 h-12 flex items-center justify-between px-6"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
      >
        {/* Left — breadcrumb */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden p-1 text-muted-foreground hover:text-foreground transition-interactive"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Breadcrumb */}
          <p
            className="text-xs tracking-[0.18em] uppercase text-muted-foreground"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            EVENTFLOW / {pathLabel}
          </p>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-3">
          <button
            className="relative p-1.5 text-muted-foreground hover:text-foreground transition-interactive"
            aria-label="Notifications"
          >
            <Bell className="h-3.5 w-3.5" aria-hidden="true" />
            <span
              className="absolute top-1 right-1 h-1 w-1 rounded-full"
              style={{ backgroundColor: 'var(--primary)' }}
              aria-hidden="true"
            />
          </button>

          {/* Avatar */}
          <div
            className="h-7 w-7 flex items-center justify-center text-xs select-none cursor-default border border-border"
            style={{
              fontFamily: 'Courier New, monospace',
              color: 'var(--muted-foreground)',
            }}
            aria-label={`Signed in as ${displayName}`}
            title={userEmail ?? undefined}
          >
            {avatarInitials}
          </div>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userEmail={userEmail ?? undefined}
        userRole={userRole}
      />
    </>
  )
}
