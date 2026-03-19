import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { formatDate, formatDateTime } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/Badge'
import { CalendarDays, MapPin, Users, Clock } from 'lucide-react'
import { RSVPForm } from '@/components/guests/RSVPForm'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await db.event.findUnique({
    where: { slug, visibility: 'PUBLIC' },
    select: { title: true, metaTitle: true, metaDescription: true, description: true },
  })
  if (!event) return { title: 'Event Not Found' }
  return {
    title: event.metaTitle ?? event.title,
    description: event.metaDescription ?? event.description ?? undefined,
    openGraph: {
      title: event.metaTitle ?? event.title,
      description: event.metaDescription ?? event.description ?? undefined,
    },
  }
}

export default async function PublicEventPage({ params }: PageProps) {
  const { slug } = await params

  const event = await db.event.findUnique({
    where: { slug, visibility: 'PUBLIC' },
    include: {
      venue: { select: { name: true, city: true, country: true, capacity: true } },
      tickets: { where: { status: 'ACTIVE' } },
      _count: { select: { guests: true } },
    },
  })

  if (!event) notFound()

  const spotsLeft = event.maxCapacity
    ? event.maxCapacity - event._count.guests
    : null

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative bg-foreground text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(var(--accent)) 0%, transparent 60%)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-16 sm:py-24">
          <div className="flex items-center gap-3 mb-4">
            <StatusBadge status={event.status} />
            <span className="text-sm opacity-70">{event.type.replace('_', ' ')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">{event.title}</h1>
          {event.description && (
            <p className="text-base opacity-80 max-w-2xl leading-relaxed">{event.description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Details */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">Event Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(event.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {event.venue && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-muted-foreground">Venue</p>
                      <p className="text-sm font-medium text-foreground">{event.venue.name}</p>
                      {(event.venue.city || event.venue.country) && (
                        <p className="text-xs text-muted-foreground">
                          {[event.venue.city, event.venue.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {spotsLeft !== null && (
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-muted-foreground">Availability</p>
                      <p className="text-sm font-medium text-foreground">
                        {spotsLeft > 0 ? `${spotsLeft} spots remaining` : 'Sold out'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tickets */}
            {event.tickets.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4">Tickets</h2>
                <div className="space-y-3">
                  {event.tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{ticket.name}</p>
                        {ticket.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{ticket.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">
                          {ticket.price === 0 ? 'Free' : `${event.currency} ${ticket.price.toLocaleString()}`}
                        </p>
                        {ticket.quantity && (
                          <p className="text-xs text-muted-foreground">{ticket.quantity - ticket.sold} left</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RSVP Sidebar */}
          <div>
            <div className="sticky top-6 bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">Register for this Event</h2>
              <RSVPForm eventId={event.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
