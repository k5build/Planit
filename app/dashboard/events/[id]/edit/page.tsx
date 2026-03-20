import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { EventEditClient } from '@/components/events/EventEditClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const event = await db.event.findUnique({ where: { id }, select: { title: true } })
  return { title: `Edit — ${event?.title ?? 'Event'}` }
}

export default async function EventEditPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params

  const event = await db.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      status: true,
      visibility: true,
      startDate: true,
      endDate: true,
      timezone: true,
      maxCapacity: true,
      currency: true,
      plannerId: true,
      clientId: true,
    },
  })

  if (!event) notFound()

  const isAdmin = session.user.role === 'SUPER_ADMIN'
  const canEdit = isAdmin || event.plannerId === session.user.id

  if (!canEdit) redirect(`/dashboard/events/${id}`)

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-5 mb-10">
        <Link
          href={`/dashboard/events/${id}`}
          className="mt-1.5 text-muted-foreground hover:text-foreground transition-interactive"
          aria-label="Back to event"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div>
          <p
            className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            EDITING EVENT
          </p>
          <h1
            className="text-5xl sm:text-6xl font-light italic text-foreground"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            {event.title}
          </h1>
        </div>
      </div>

      <hr className="border-border mb-10" />

      <EventEditClient event={event} />
    </div>
  )
}
