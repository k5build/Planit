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
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'

const STEPS = ['Basics', 'Details', 'Venue & Pricing', 'Publish'] as const
type Step = (typeof STEPS)[number]

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
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div
              className={cn(
                'flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold transition-interactive',
                i < step
                  ? 'bg-primary text-primary-foreground'
                  : i === step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground border border-border'
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
            </div>
            <span className={cn('text-xs hidden sm:block', i === step ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn('h-px w-6 sm:w-10 mx-1', i < step ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card padding="lg">
          {/* Step 0 — Basics */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Event Basics</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Name and categorize your event</p>
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
                <h2 className="text-base font-semibold text-foreground">Date and Capacity</h2>
                <p className="text-xs text-muted-foreground mt-0.5">When and how many guests</p>
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
                <h2 className="text-base font-semibold text-foreground">Venue and Budget</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Financial and location details</p>
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
                <h2 className="text-base font-semibold text-foreground">Publishing Settings</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Control event visibility and status</p>
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
                <p role="alert" className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">
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
