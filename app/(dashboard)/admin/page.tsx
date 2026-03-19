import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import { StatCard } from '@/components/ui/Table'
import { Users, CalendarDays, Building2, Activity } from 'lucide-react'

export const metadata: Metadata = { title: 'Admin Panel' }

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'SUPER_ADMIN') redirect('/dashboard')

  const [userCount, eventCount, vendorCount, recentAuditLogs, recentUsers] = await Promise.all([
    db.user.count(),
    db.event.count(),
    db.vendor.count(),
    db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { user: { select: { email: true } } },
    }),
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    }),
  ])

  const ROLE_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'default'> = {
    SUPER_ADMIN: 'error',
    PLANNER: 'primary',
    CLIENT: 'success',
    VENDOR: 'warning',
    GUEST: 'default',
    FINANCE: 'primary',
    MARKETING: 'warning',
    OPERATIONS: 'success',
    SUPPORT: 'default',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">System overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={userCount} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Total Events" value={eventCount} icon={<CalendarDays className="h-4 w-4" />} />
        <StatCard label="Total Vendors" value={vendorCount} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Audit Logs" value={recentAuditLogs.length} sub="Recent 20" icon={<Activity className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <div className="mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/20 transition-interactive">
                    <td className="px-4 py-3 text-xs font-medium text-foreground truncate max-w-40">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_COLORS[user.role] ?? 'default'} className="text-xs">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant={user.isActive ? 'success' : 'error'} className="text-xs">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Audit Log */}
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <CardTitle>Recent Audit Log</CardTitle>
          </CardHeader>
          <div className="mt-4">
            <div className="divide-y divide-border/60">
              {recentAuditLogs.map((log) => (
                <div key={log.id} className="px-5 py-3 hover:bg-secondary/20 transition-interactive">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">{log.action}</p>
                      {log.user?.email && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{log.user.email}</p>
                      )}
                      {log.entity && (
                        <p className="text-xs text-muted-foreground">
                          {log.entity} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {recentAuditLogs.length === 0 && (
                <p className="px-5 py-8 text-xs text-muted-foreground text-center">No audit logs yet</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
