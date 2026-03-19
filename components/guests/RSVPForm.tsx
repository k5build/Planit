'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResolver = any
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Check } from 'lucide-react'

const rsvpSchema = z.object({
  firstName: z.string().min(1, 'Required').max(100),
  lastName: z.string().min(1, 'Required').max(100),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  dietaryNeeds: z.string().optional(),
  plusOnes: z.number().int().min(0).max(10).default(0),
})

type RSVPInput = z.infer<typeof rsvpSchema>

export function RSVPForm({ eventId }: { eventId: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RSVPInput>({
    resolver: zodResolver(rsvpSchema) as AnyResolver,
    defaultValues: { plusOnes: 0 },
  })

  async function onSubmit(data: RSVPInput) {
    setServerError('')
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, eventId, rsvpStatus: 'CONFIRMED' }),
      })
      if (!res.ok) {
        const json = await res.json()
        setServerError(json.error ?? 'Registration failed.')
        return
      }
      setSubmitted(true)
    } catch {
      setServerError('Network error. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-success/15 mb-4">
          <Check className="h-6 w-6 text-success" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-foreground">You are registered!</p>
        <p className="text-xs text-muted-foreground mt-1.5">
          Check your email for confirmation details.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="First name"
          placeholder="Jane"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Last name"
          placeholder="Smith"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Phone (optional)"
        type="tel"
        placeholder="+1 555 000 0000"
        {...register('phone')}
      />
      <Input
        label="Dietary needs (optional)"
        placeholder="e.g. Vegetarian"
        {...register('dietaryNeeds')}
      />
      <Input
        label="Additional guests"
        type="number"
        min={0}
        max={10}
        defaultValue={0}
        {...register('plusOnes', { valueAsNumber: true })}
      />

      {serverError && (
        <p role="alert" className="text-xs text-destructive">{serverError}</p>
      )}

      <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
        Confirm Registration
      </Button>
    </form>
  )
}
