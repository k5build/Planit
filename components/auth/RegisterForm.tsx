'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function RegisterForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
    setServerError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error ?? 'Registration failed.')
        return
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setSuccess(true) // Account created, redirect to login
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setServerError('Network error. Please try again.')
    }
  }

  if (success) {
    return (
      <div className="py-10 border border-border text-center">
        <p
          className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          ACCOUNT CREATED
        </p>
        <p
          className="text-2xl font-light italic text-foreground"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          Welcome to EventFlow.
        </p>
        <p className="text-xs text-muted-foreground mt-3">Redirecting you to sign in...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Full name"
        type="text"
        autoComplete="name"
        placeholder="Jane Smith"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="Min. 8 chars, 1 uppercase, 1 number"
        error={errors.password?.message}
        hint="Must be at least 8 characters with an uppercase letter and number"
        {...register('password')}
      />
      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {serverError && (
        <div role="alert" className="text-xs text-destructive border border-destructive/30 px-4 py-3">
          {serverError}
        </div>
      )}

      <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
        Create account
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        By creating an account you agree to our{' '}
        <a href="/terms" className="text-primary hover:opacity-80">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="text-primary hover:opacity-80">Privacy Policy</a>
      </p>
    </form>
  )
}
