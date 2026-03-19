import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Sign In' }

export default async function LoginPage() {
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
            MEMBER ACCESS
          </p>
          <h2
            className="text-5xl font-light italic leading-tight mb-10"
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              color: '#FAF8F5',
            }}
          >
            Welcome<br />back.
          </h2>
          <hr style={{ borderColor: '#1F1E1E', marginBottom: '2rem' }} />
          <ul className="space-y-4">
            {[
              'Manage your events',
              'Track guest RSVPs',
              'Monitor budgets',
              'Coordinate vendors',
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm"
                style={{ color: '#9A9390' }}
              >
                <span
                  className="text-xs mt-0.5 shrink-0"
                  style={{ fontFamily: 'Courier New, monospace', color: '#B8956A' }}
                >
                  →
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer quote */}
        <div>
          <blockquote
            className="text-sm italic leading-relaxed mb-3"
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              color: '#6B6560',
            }}
          >
            "Every great event begins with a single detail perfectly placed."
          </blockquote>
          <p
            className="text-xs"
            style={{ fontFamily: 'Courier New, monospace', color: '#3A3937' }}
          >
            © EVENTFLOW 2026
          </p>
        </div>
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
            EVENTFLOW / SIGN IN
          </p>

          {/* Heading */}
          <h1
            className="text-4xl sm:text-5xl font-light italic text-foreground mb-2"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Sign in.
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Continue to your workspace
          </p>

          <hr className="border-border mb-10" />

          <LoginForm googleEnabled={!!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)} />

          <p className="text-xs text-muted-foreground mt-8 text-center">
            No account?{' '}
            <Link
              href="/register"
              className="text-foreground underline underline-offset-4 hover:opacity-70 transition-interactive"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}
