'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Dropdown'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createGuestSchema, type CreateGuestInput } from '@/lib/validations/guest'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResolver = any
import { UserPlus, Search, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  rsvpStatus: string
  plusOnes: number
  tableNumber: string | null
  event?: { title: string } | null
  eventId: string
}

interface GuestTableClientProps {
  guests: Guest[]
  total: number
  page: number
  limit: number
  eventId?: string
}

const RSVP_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'DECLINED', label: 'Declined' },
  { value: 'WAITLISTED', label: 'Waitlisted' },
  { value: 'NO_SHOW', label: 'No Show' },
]

export function GuestTableClient({ guests, total, page, limit, eventId }: GuestTableClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateGuestInput>({
    resolver: zodResolver(createGuestSchema) as AnyResolver,
    defaultValues: { eventId: eventId ?? '', plusOnes: 0, rsvpStatus: 'PENDING' },
  })

  const filtered = guests.filter((g) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      g.firstName.toLowerCase().includes(q) ||
      g.lastName.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q)
    )
  })

  async function onSubmit(data: CreateGuestInput) {
    setServerError('')
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        setServerError(json.error ?? 'Failed to add guest.')
        return
      }
      reset()
      setAddOpen(false)
      router.refresh()
    } catch {
      setServerError('Network error. Please try again.')
    }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guests..."
            className="w-full pl-9 pr-4 h-9 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/55 focus:outline-none focus:ring-2 focus:ring-ring/20"
            aria-label="Search guests"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.refresh()}
          aria-label="Refresh"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </Button>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Add Guest
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">RSVP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Table</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">+Ones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No guests found
                  </td>
                </tr>
              ) : (
                filtered.map((guest) => (
                  <tr key={guest.id} className="border-b border-border/50 hover:bg-secondary/20 transition-interactive">
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      {guest.firstName} {guest.lastName}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell text-xs">
                      {guest.email}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={guest.rsvpStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">
                      {guest.event?.title ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">
                      {guest.tableNumber ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden sm:table-cell">
                      {guest.plusOnes > 0 ? `+${guest.plusOnes}` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Guest Modal */}
      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); reset(); setServerError('') }}
        title="Add Guest"
        description="Add a new guest to the event"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('eventId')} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="Jane"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last Name"
              placeholder="Smith"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="jane@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="+1 555 000 0000"
            {...register('phone')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="RSVP Status"
              options={RSVP_OPTIONS}
              {...register('rsvpStatus')}
            />
            <Input
              label="Plus Ones"
              type="number"
              min={0}
              max={10}
              defaultValue={0}
              {...register('plusOnes', { valueAsNumber: true })}
            />
          </div>
          <Input label="Dietary Needs" placeholder="e.g. Vegetarian, Gluten-free" {...register('dietaryNeeds')} />

          {serverError && (
            <p role="alert" className="text-xs text-destructive">{serverError}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { setAddOpen(false); reset() }}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Add Guest
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
