'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Dropdown'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResolver = any

const editEventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  type: z.enum([
    'WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONFERENCE',
    'EXHIBITION', 'GALA', 'WORKSHOP', 'PRIVATE', 'OTHER',
  ]),
  status: z.enum([
    'DRAFT', 'PUBLISHED', 'CONFIRMED', 'IN_PROGRESS',
    'COMPLETED', 'CANCELLED', 'POSTPONED',
  ]),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  timezone: z.string().default('UTC'),
  maxCapacity: z.number().int().positive().optional().or(z.nan().transform(() => undefined)),
  currency: z.string().length(3).default('USD'),
})

type EditEventInput = z.infer<typeof editEventSchema>

interface EventData {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  visibility: string
  startDate: Date
  endDate: Date
  timezone: string
  maxCapacity: number | null
  currency: string
}

interface EventEditClientProps {
  event: EventData
}

const EVENT_TYPES = [
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'BIRTHDAY', label: 'Birthday' },
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'EXHIBITION', label: 'Exhibition' },
  { value: 'GALA', label: 'Gala' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'OTHER', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'POSTPONED', label: 'Postponed' },
]

const VISIBILITY_OPTIONS = [
  { value: 'PRIVATE', label: 'Private — only invited guests' },
  { value: 'UNLISTED', label: 'Unlisted — link only' },
  { value: 'PUBLIC', label: 'Public — searchable' },
]

const CURRENCIES = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'SAR', label: 'SAR — Saudi Riyal' },
]

function toDatetimeLocal(date: Date): string {
  const d = new Date(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EventEditClient({ event }: EventEditClientProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditEventInput>({
    resolver: zodResolver(editEventSchema) as AnyResolver,
    defaultValues: {
      title: event.title,
      description: event.description ?? '',
      type: event.type as EditEventInput['type'],
      status: event.status as EditEventInput['status'],
      visibility: event.visibility as EditEventInput['visibility'],
      startDate: toDatetimeLocal(event.startDate),
      endDate: toDatetimeLocal(event.endDate),
      timezone: event.timezone,
      maxCapacity: event.maxCapacity ?? undefined,
      currency: event.currency,
    },
  })

  async function onSubmit(data: EditEventInput) {
    setServerError('')
    try {
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        maxCapacity: Number.isNaN(data.maxCapacity) ? undefined : data.maxCapacity,
      }

      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json()
        setServerError(json.error ?? 'Failed to update event.')
        return
      }

      router.push(`/dashboard/events/${event.id}`)
      router.refresh()
    } catch {
      setServerError('Network error. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-10">

      {/* ── SECTION: BASICS ───────────────────────────────────────────────── */}
      <div>
        <p
          className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          BASICS
        </p>
        <div className="space-y-5">
          <Input
            label="Event Title"
            placeholder="e.g. Annual Company Gala 2026"
            error={errors.title?.message}
            {...register('title')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label="Event Type"
              options={EVENT_TYPES}
              error={errors.type?.message}
              {...register('type')}
            />
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              error={errors.status?.message}
              {...register('status')}
            />
          </div>
          <Textarea
            label="Description"
            placeholder="Describe your event..."
            rows={4}
            {...register('description')}
          />
        </div>
      </div>

      <hr className="border-border" />

      {/* ── SECTION: SCHEDULE ─────────────────────────────────────────────── */}
      <div>
        <p
          className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          SCHEDULE
        </p>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Start Date and Time"
              type="datetime-local"
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Input
              label="End Date and Time"
              type="datetime-local"
              error={errors.endDate?.message}
              {...register('endDate')}
            />
          </div>
          <Input
            label="Timezone"
            placeholder="e.g. America/New_York"
            {...register('timezone')}
          />
        </div>
      </div>

      <hr className="border-border" />

      {/* ── SECTION: SETTINGS ─────────────────────────────────────────────── */}
      <div>
        <p
          className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          SETTINGS
        </p>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label="Visibility"
              options={VISIBILITY_OPTIONS}
              {...register('visibility')}
            />
            <Select
              label="Currency"
              options={CURRENCIES}
              {...register('currency')}
            />
          </div>
          <Input
            label="Maximum Capacity"
            type="number"
            placeholder="Leave blank for unlimited"
            min={1}
            error={errors.maxCapacity?.message}
            {...register('maxCapacity', { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* ── ERROR + ACTIONS ────────────────────────────────────────────────── */}
      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="flex items-center gap-4 pt-2">
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!isDirty}
        >
          Save Changes
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/events/${event.id}`)}
        >
          Cancel
        </Button>
      </div>

    </form>
  )
}
