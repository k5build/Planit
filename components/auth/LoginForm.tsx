'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoginForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [demoLoading, setDemoLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setServerError('')
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setServerError('Invalid email or password. Please try again.')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  async function handleDemo() {
    setDemoLoading(true)
    setServerError('')
    const result = await signIn('credentials', {
      email: 'admin@eventflow.com',
      password: 'Demo1234!',
      redirect: false,
    })
    if (result?.error) {
      setServerError('Demo login failed. Please try the credentials manually.')
      setDemoLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="w-full space-y-1">
        <label
          htmlFor="password"
          className="block text-xs tracking-[0.12em] uppercase text-muted-foreground"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Your password"
            className={cn(
              'input-editorial pr-10',
              errors.password && 'border-b-destructive'
            )}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-interactive"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <p role="alert" className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <div role="alert" className="text-xs text-destructive border border-destructive/30 px-4 py-3">
          {serverError}
        </div>
      )}

      <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
        Sign in
      </Button>

      {googleEnabled && (
        <>
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => signIn('google', { callbackUrl })}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </Button>
        </>
      )}

      <p className="text-center text-xs text-muted-foreground mt-4">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary hover:opacity-80 font-medium">
          Create one
        </Link>
      </p>

      {/* Demo access */}
      <div className="mt-8 pt-6 border-t border-border">
        <p
          className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4 text-center"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          OR EXPLORE THE DEMO
        </p>
        <button
          type="button"
          onClick={handleDemo}
          disabled={demoLoading}
          className="w-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 h-10 px-7 text-[0.7rem] tracking-[0.15em] uppercase flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          {demoLoading && <Loader2 className="h-3 w-3 animate-spin shrink-0" />}
          ( CONTINUE AS GUEST )
        </button>
        <p className="text-center text-xs text-muted-foreground mt-3" style={{ fontFamily: 'Courier New, monospace' }}>
          Full access · No signup required
        </p>
      </div>
    </form>
  )
}
