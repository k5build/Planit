import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Create Account' }

export default async function RegisterPage() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 p-14"
        style={{ backgroundColor: '#111010' }}
      >
        {/* Logo */}
        <p
          className="text-xs tracking-[0.25em] uppercase"
          style={{ fontFamily: 'Courier New, monospace', color: '#C4BDB7' }}
        >
          EVENTFLOW
        </p>

        {/* Main content */}
        <div>
          <p
            className="text-xs tracking-[0.2em] uppercase mb-6"
            style={{ fontFamily: 'Courier New, monospace', color: '#6B6560' }}
          >
            NEW MEMBERSHIP
          </p>
          <h2
            className="text-5xl font-light italic leading-tight mb-10"
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              color: '#FAF8F5',
            }}
          >
            Join<br />EventFlow.
          </h2>
          <hr style={{ borderColor: '#1F1E1E', marginBottom: '2rem' }} />
          <ul className="space-y-4">
            {[
              { type: 'WEDDINGS', desc: 'Full wedding lifecycle management' },
              { type: 'GALAS', desc: 'Elegant gala dinner coordination' },
              { type: 'CORPORATE', desc: 'Conferences and brand events' },
              { type: 'PRIVATE', desc: 'Intimate personal celebrations' },
            ].map((item) => (
              <li key={item.type} className="flex items-start gap-4">
                <span
                  className="text-xs mt-0.5 shrink-0 tracking-[0.12em]"
                  style={{ fontFamily: 'Courier New, monospace', color: '#B8956A' }}
                >
                  {item.type}
                </span>
                <span className="text-xs" style={{ color: '#6B6560' }}>
                  {item.desc}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p
          className="text-xs"
          style={{ fontFamily: 'Courier New, monospace', color: '#3A3937' }}
        >
          © EVENTFLOW 2026
        </p>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <p
            className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-10 lg:hidden"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            EVENTFLOW
          </p>

          {/* Breadcrumb */}
          <p
            className="text-xs tracking-[0.18em] uppercase text-muted-foreground mb-10"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            EVENTFLOW / CREATE ACCOUNT
          </p>

          {/* Heading */}
          <h1
            className="text-4xl sm:text-5xl font-light italic text-foreground mb-2"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Get started.
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Create your EventFlow account
          </p>

          <hr className="border-border mb-10" />

          <RegisterForm />

          <p className="text-xs text-muted-foreground mt-8 text-center">
            Already a member?{' '}
            <Link
              href="/login"
              className="text-foreground underline underline-offset-4 hover:opacity-70 transition-interactive"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}
