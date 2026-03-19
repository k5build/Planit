'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createEventSchema, type CreateEventInput } from '@/lib/validations/event'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResolver = any
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Dropdown'
import { Card } from '@/components/ui/Card'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'

const STEPS = ['Basics', 'Details', 'Venue & Pricing', 'Publish'] as const

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

export function EventForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema) as AnyResolver,
    defaultValues: {
      type: 'OTHER',
      status: 'DRAFT',
      visibility: 'PRIVATE',
      currency: 'USD',
      timezone: 'UTC',
    },
  })

  async function handleNext() {
    const fields = getStepFields(step)
    const valid = await trigger(fields as (keyof CreateEventInput)[])
    if (valid) setStep((s) => s + 1)
  }

  async function onSubmit(data: CreateEventInput) {
    setServerError('')
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        setServerError(json.error ?? 'Failed to create event.')
        return
      }
      const event = await res.json()
      router.push(`/dashboard/events/${event.id}`)
    } catch {
      setServerError('Network error. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-0 border border-border w-fit">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className="flex items-center gap-2.5 px-4 py-2.5 border-r border-border last:border-r-0"
            style={{
              backgroundColor: i === step ? 'var(--foreground)' : 'transparent',
            }}
          >
            <span
              className="text-xs tabular-nums"
              style={{
                fontFamily: 'Courier New, monospace',
                color: i === step ? 'var(--background)' : i < step ? 'var(--primary)' : 'var(--muted-foreground)',
              }}
            >
              {i < step ? '✓' : String(i + 1).padStart(2, '0')}
            </span>
            <span
              className="text-xs hidden sm:block tracking-[0.1em] uppercase"
              style={{
                fontFamily: 'Courier New, monospace',
                color: i === step ? 'var(--background)' : i < step ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}
            >
              {s}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card padding="lg">
          {/* Step 0 — Basics */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground" style={{ fontFamily: 'Courier New, monospace' }}>EVENT BASICS</h2>
                <p className="text-sm text-foreground mt-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem' }}>Name and categorize your event</p>
              </div>
              <Input
                label="Event Title"
                placeholder="e.g. Annual Company Gala 2026"
                error={errors.title?.message}
                {...register('title')}
              />
              <Select
                label="Event Type"
                options={EVENT_TYPES}
                error={errors.type?.message}
                {...register('type')}
              />
              <Textarea
                label="Description"
                placeholder="Describe your event..."
                hint="Shown on the public event page"
                rows={4}
                {...register('description')}
              />
            </div>
          )}

          {/* Step 1 — Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground" style={{ fontFamily: 'Courier New, monospace' }}>DATE AND CAPACITY</h2>
                <p className="text-sm text-foreground mt-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem' }}>When and how many guests</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Maximum Capacity"
                  type="number"
                  placeholder="Leave blank for unlimited"
                  min={1}
                  error={errors.maxCapacity?.message}
                  {...register('maxCapacity', { valueAsNumber: true })}
                />
                <Input
                  label="Expected Guests"
                  type="number"
                  placeholder="Your best estimate"
                  min={1}
                  {...register('expectedGuests', { valueAsNumber: true })}
                />
              </div>
              <Input
                label="Timezone"
                placeholder="e.g. America/New_York"
                defaultValue="UTC"
                {...register('timezone')}
              />
            </div>
          )}

          {/* Step 2 — Venue and Pricing */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground" style={{ fontFamily: 'Courier New, monospace' }}>VENUE AND BUDGET</h2>
                <p className="text-sm text-foreground mt-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem' }}>Financial and location details</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Total Budget"
                  type="number"
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  error={errors.budgetTotal?.message}
                  {...register('budgetTotal', { valueAsNumber: true })}
                />
                <Select
                  label="Currency"
                  options={CURRENCIES}
                  {...register('currency')}
                />
              </div>
              <Input
                label="Meta Title"
                placeholder="SEO title for public page"
                hint="Max 160 characters"
                {...register('metaTitle')}
              />
              <Textarea
                label="Meta Description"
                placeholder="SEO description..."
                rows={2}
                hint="Max 320 characters"
                {...register('metaDescription')}
              />
            </div>
          )}

          {/* Step 3 — Publish */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground" style={{ fontFamily: 'Courier New, monospace' }}>PUBLISHING SETTINGS</h2>
                <p className="text-sm text-foreground mt-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem' }}>Control event visibility and status</p>
              </div>
              <Select
                label="Visibility"
                options={VISIBILITY_OPTIONS}
                {...register('visibility')}
              />
              <Select
                label="Initial Status"
                options={[
                  { value: 'DRAFT', label: 'Draft — not visible yet' },
                  { value: 'PUBLISHED', label: 'Published — visible to guests' },
                ]}
                {...register('status')}
              />

              {serverError && (
                <p role="alert" className="text-xs text-destructive border border-destructive/30 px-4 py-3">
                  {serverError}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Continue
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button type="submit" loading={isSubmitting}>
              Create Event
              <Check className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

function getStepFields(step: number): string[] {
  switch (step) {
    case 0: return ['title', 'type']
    case 1: return ['startDate', 'endDate']
    case 2: return ['budgetTotal', 'currency']
    default: return []
  }
}
