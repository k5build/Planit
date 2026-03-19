import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { EventForm } from '@/components/events/EventForm'

export const metadata: Metadata = { title: 'Create Event' }

export default async function NewEventPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  if (!['SUPER_ADMIN', 'PLANNER'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-2xl">
      {/* ── STEP INDICATOR ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-10">
        <p
          className="text-xs tracking-[0.2em] uppercase text-primary"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          01 / 04
        </p>
        <div className="flex-1 h-px bg-border">
          <div className="h-full w-1/4 bg-primary" />
        </div>
        <p
          className="text-xs tracking-[0.2em] uppercase text-muted-foreground"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          BASICS
        </p>
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <p
        className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4"
        style={{ fontFamily: 'Courier New, monospace' }}
      >
        EVENTFLOW / CREATE EVENT
      </p>
      <h1
        className="text-4xl sm:text-5xl font-light italic text-foreground mb-3"
        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
      >
        Tell us about<br />your event.
      </h1>
      <p className="text-sm text-muted-foreground mb-10">
        Fill in the details below. You can always edit these later.
      </p>

      <hr className="border-border mb-10" />

      <EventForm />
    </div>
  )
}
