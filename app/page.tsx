import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-14 flex items-center justify-between">
          {/* Logo */}
          <span
            className="text-xs tracking-[0.25em] uppercase"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            EVENTFLOW
          </span>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
            {['HOME', 'SERVICES', 'ABOUT', 'CONTACT'].map((label) => (
              <span
                key={label}
                className="text-xs tracking-[0.18em] text-muted-foreground hover:text-foreground transition-interactive cursor-default"
                style={{ fontFamily: 'Courier New, monospace' }}
              >
                {label}
              </span>
            ))}
          </nav>

          {/* CTA */}
          <Link
            href="/register"
            className="border border-foreground px-5 py-2 text-xs tracking-[0.15em] uppercase hover:bg-foreground hover:text-background transition-all duration-200"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            ( GET STARTED )
          </Link>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 pt-16 pb-20">
        {/* Image grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-14 h-[340px] sm:h-[420px]">
          <div className="bg-[#E8E4DF] col-span-1 row-span-1" style={{ backgroundImage: 'linear-gradient(135deg, #E8E4DF 0%, #D4CEC9 100%)' }} />
          <div className="bg-[#DDD8D2] col-span-1 sm:col-span-2" style={{ backgroundImage: 'linear-gradient(160deg, #D9D4CE 0%, #CBC4BC 100%)' }} />
          <div className="bg-[#E2DDD8]" style={{ backgroundImage: 'linear-gradient(135deg, #E2DDD8 0%, #D0C9C2 100%)' }} />
        </div>

        {/* Hero text */}
        <div className="max-w-5xl">
          <p
            className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-5"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            / Luxury Event Planning
          </p>
          <h1
            className="text-5xl sm:text-7xl lg:text-8xl font-light italic leading-[0.9] text-foreground mb-6"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Plan events that<br />
            people remember
          </h1>
          <p
            className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-10"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            WEDDINGS · GALAS · CONFERENCES · CELEBRATIONS
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="border border-foreground px-8 py-3 text-xs tracking-[0.15em] uppercase hover:bg-foreground hover:text-background transition-all duration-200 text-center"
              style={{ fontFamily: 'Courier New, monospace' }}
            >
              ( PLAN YOUR EVENT )
            </Link>
            <Link
              href="/login"
              className="border border-border px-8 py-3 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:border-foreground hover:text-foreground transition-all duration-200 text-center"
              style={{ fontFamily: 'Courier New, monospace' }}
            >
              ( SIGN IN )
            </Link>
          </div>
        </div>
      </section>

      {/* ── MARQUEE 1 ────────────────────────────────────────────────────────── */}
      <div className="border-t border-b border-border overflow-hidden py-5">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <span
              key={i}
              className="flex shrink-0 items-center gap-8"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {[
                'WEDDINGS', '—', 'GALAS', '—', 'CONFERENCES', '—',
                'BIRTHDAYS', '—', 'LUXURY EVENTS', '—', 'CORPORATE', '—',
                'PRIVATE CELEBRATIONS', '—', 'GALA DINNERS', '—',
              ].map((word, j) => (
                <span
                  key={`${i}-${j}`}
                  className="text-4xl sm:text-5xl font-light text-foreground px-4"
                >
                  {word}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── ABOUT ────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div
            className="aspect-[3/4] w-full max-w-md"
            style={{ background: 'linear-gradient(160deg, #E8E4DF 0%, #CBC4BC 100%)' }}
          />
          {/* Text */}
          <div>
            <p
              className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6"
              style={{ fontFamily: 'Courier New, monospace' }}
            >
              WHAT WE DO
            </p>
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-light italic leading-tight text-foreground mb-8"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              Mastering the art<br />of experience
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-sm">
              EventFlow is a complete event planning platform designed for professionals who demand
              precision. Manage guests, budgets, vendors, and timelines from a single elegant workspace.
              Every detail, orchestrated.
            </p>
            <Link
              href="/register"
              className="border border-foreground px-8 py-3 text-xs tracking-[0.15em] uppercase hover:bg-foreground hover:text-background transition-all duration-200"
              style={{ fontFamily: 'Courier New, monospace' }}
            >
              ( OUR SERVICES )
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 pb-24">
        <hr className="border-border mb-16" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
          {[
            {
              fig: 'FIG. 01',
              title: 'Wedding Planning',
              desc: 'Full-service wedding coordination from initial concept to final send-off. Vendor management, guest lists, and timeline perfection.',
            },
            {
              fig: 'FIG. 02',
              title: 'Corporate Events',
              desc: 'Conferences, product launches, and company celebrations executed with precision. Every detail aligned with your brand vision.',
            },
            {
              fig: 'FIG. 03',
              title: 'Gala Dinners',
              desc: 'Sophisticated evening galas and charity fundraisers. Seamless seating, catering coordination, and program management.',
            },
            {
              fig: 'FIG. 04',
              title: 'Private Celebrations',
              desc: 'Birthdays, anniversaries, and milestone celebrations crafted with intimacy. Personalized to every detail you care about.',
            },
          ].map((service) => (
            <div key={service.fig} className="bg-background p-8 sm:p-10">
              <p
                className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6"
                style={{ fontFamily: 'Courier New, monospace' }}
              >
                {service.fig}
              </p>
              <div
                className="aspect-video w-full mb-6"
                style={{ background: 'linear-gradient(135deg, #E8E4DF 0%, #D0C9C2 100%)' }}
              />
              <h3
                className="text-2xl sm:text-3xl font-light italic text-foreground mb-3"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
        <hr className="border-border mt-0" />
      </section>

      {/* ── TESTIMONIAL ──────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 sm:px-10 py-24 text-center">
        <blockquote>
          <p
            className="text-3xl sm:text-4xl lg:text-5xl font-light italic leading-tight text-foreground mb-8"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            "EventFlow transformed how we manage our events. Every detail, perfectly orchestrated."
          </p>
          <footer>
            <p
              className="text-xs tracking-[0.2em] uppercase text-muted-foreground"
              style={{ fontFamily: 'Courier New, monospace' }}
            >
              — SARAH K., SENIOR EVENT PLANNER
            </p>
          </footer>
        </blockquote>
      </section>

      {/* ── MARQUEE 2 ────────────────────────────────────────────────────────── */}
      <div className="border-t border-b border-border overflow-hidden py-5">
        <div className="flex animate-marquee-slow whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <span
              key={i}
              className="flex shrink-0 items-center gap-8"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {[
                'PLANNING', '—', 'PRODUCTION', '—', 'COORDINATION', '—',
                'ART DIRECTION', '—', 'DESIGN', '—', 'EXECUTION', '—',
                'CURATION', '—', 'MANAGEMENT', '—',
              ].map((word, j) => (
                <span
                  key={`${i}-${j}`}
                  className="text-4xl sm:text-5xl font-light italic text-muted-foreground px-4"
                >
                  {word}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── CTA SECTION ──────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#0A0908' }} className="px-6 sm:px-10 py-28 text-center">
        <p
          className="text-xs tracking-[0.25em] uppercase mb-6"
          style={{ fontFamily: 'Courier New, monospace', color: '#C4BDB7' }}
        >
          START TODAY
        </p>
        <h2
          className="text-4xl sm:text-6xl lg:text-7xl font-light italic mb-10"
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            color: '#FAF8F5',
          }}
        >
          Your next event<br />starts here
        </h2>
        <Link
          href="/register"
          className="border border-[#FAF8F5] px-10 py-3.5 text-xs tracking-[0.15em] uppercase transition-all duration-200"
          style={{
            fontFamily: 'Courier New, monospace',
            color: '#FAF8F5',
          }}
          onMouseOver={() => {}}
        >
          ( BOOK A CONSULTATION )
        </Link>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 items-start">
            {/* Brand */}
            <div>
              <p
                className="text-xs tracking-[0.25em] uppercase text-foreground mb-3"
                style={{ fontFamily: 'Courier New, monospace' }}
              >
                EVENTFLOW
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                Professional event planning platform for those who demand excellence in every detail.
              </p>
            </div>
            {/* Links */}
            <nav aria-label="Footer navigation">
              <ul className="space-y-3">
                {[
                  { num: '00.', label: 'HOME' },
                  { num: '01.', label: 'EVENTS' },
                  { num: '02.', label: 'ABOUT' },
                  { num: '03.', label: 'CONTACT' },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    <span
                      className="text-xs text-muted-foreground"
                      style={{ fontFamily: 'Courier New, monospace' }}
                    >
                      {item.num}
                    </span>
                    <span
                      className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-interactive cursor-default"
                      style={{ fontFamily: 'Courier New, monospace' }}
                    >
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </nav>
            {/* Social + Legal */}
            <div>
              <Link
                href="/login"
                className="border border-border px-5 py-2 text-xs tracking-[0.12em] uppercase text-muted-foreground hover:border-foreground hover:text-foreground transition-all duration-200 inline-block mb-8"
                style={{ fontFamily: 'Courier New, monospace' }}
              >
                ( SIGN IN )
              </Link>
              <p
                className="text-xs text-muted-foreground"
                style={{ fontFamily: 'Courier New, monospace' }}
              >
                © EVENTFLOW 2026 | PRIVACY
              </p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
