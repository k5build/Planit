import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { CalendarDays, FileText, DollarSign, Zap } from 'lucide-react'

export const metadata: Metadata = { title: 'Client Portal' }

export default async function PortalPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/portal')

  const userId = session.user.id

  const myEvents = await db.event.findMany({
    where: { clientId: userId },
    orderBy: { startDate: 'asc' },
    include: {
      venue: { select: { name: true, city: true } },
      planner: { select: { email: true } },
      _count: { select: { guests: true } },
    },
  })

  const myInvoices = await db.invoice.findMany({
    where: { clientId: userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Portal Header */}
      <header className="bg-card border-b border-border px-6 h-14 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-white" aria-hidden="true" />
          </div>
          <span className="font-bold text-sm text-foreground">EventFlow</span>
        </div>
        <span className="text-muted-foreground text-sm">/</span>
        <span className="text-sm font-medium text-foreground">Client Portal</span>
        <div className="flex-1" />
        <p className="text-xs text-muted-foreground">{session.user.email}</p>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {myEvents.length} event{myEvents.length !== 1 ? 's' : ''} assigned to you
          </p>
        </div>

        {/* Events */}
        {myEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl">
            <CalendarDays className="h-10 w-10 text-muted-foreground/40 mb-4" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">No events yet</p>
            <p className="text-xs text-muted-foreground mt-1">Your event planner will add events here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myEvents.map((event) => (
              <div key={event.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{event.type.replace('_', ' ')}</p>
                    <h3 className="text-sm font-semibold text-foreground mt-0.5">{event.title}</h3>
                  </div>
                  <StatusBadge status={event.status} />
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {formatDate(event.startDate)}
                  </div>
                  {event.venue && (
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true">at</span>
                      {event.venue.name}{event.venue.city ? `, ${event.venue.city}` : ''}
                    </div>
                  )}
                  {event.budgetTotal && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      Budget: {formatCurrency(event.budgetTotal, event.currency)}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Planner: {event.planner.email}</span>
                  <span className="ml-auto">{event._count.guests} guests</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoices */}
        {myInvoices.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              Your Invoices
            </h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invoice</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Due Date</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-border/50 hover:bg-secondary/20 transition-interactive">
                      <td className="px-5 py-3.5 font-medium text-foreground">{inv.number}</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground hidden sm:table-cell">
                        {inv.dueDate ? formatDate(inv.dueDate) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-foreground">
                        {formatCurrency(inv.total, inv.currency)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
