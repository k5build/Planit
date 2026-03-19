'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, DollarSign, Building2 } from 'lucide-react'

/* ─── Scroll-reveal hook ─────────────────────────────────────────────────── */
function useReveal(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: threshold })
  return { ref, inView }
}

/* ─── Animated counter ───────────────────────────────────────────────────── */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <span ref={ref}>
      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {to}{suffix}
      </motion.span>
    </span>
  )
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export function LandingPage() {
  const platformReveal = useReveal()
  const featuresReveal = useReveal()
  const statsReveal = useReveal()
  const pricingReveal = useReveal()
  const ctaReveal = useReveal()

  const ACCENT = '#B8956A'

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Inter, var(--font-inter), system-ui, sans-serif' }}>

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '60px',
          backgroundColor: '#000',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
        }}
      >
        {/* Logo */}
        <span style={{ fontWeight: 500, fontSize: '11px', letterSpacing: '0.3em', color: '#fff' }}>
          EVENTFLOW
        </span>

        {/* Center nav */}
        <nav
          aria-label="Primary navigation"
          style={{ display: 'flex', gap: '36px' }}
          className="hidden md:flex"
        >
          {[
            { label: 'PLATFORM', href: '#platform' },
            { label: 'FEATURES', href: '#features' },
            { label: 'PRICING',  href: '#pricing' },
            { label: 'CONTACT',  href: '#contact' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', textDecoration: 'none' }}
              className="hover:text-white transition-interactive"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            href="/login"
            style={{
              fontSize: '11px',
              letterSpacing: '0.18em',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '6px 16px',
              textDecoration: 'none',
            }}
            className="hover:border-white hover:text-white transition-interactive"
          >
            ( SIGN IN )
          </Link>
          <Link
            href="/register"
            style={{
              fontSize: '11px',
              letterSpacing: '0.18em',
              color: '#000',
              backgroundColor: ACCENT,
              border: `1px solid ${ACCENT}`,
              padding: '6px 16px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
            className="cta-shimmer hover:opacity-90 transition-interactive"
          >
            ( GET STARTED )
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '900px', padding: '0 24px' }}>
          {/* Staggered headline */}
          <div style={{ overflow: 'hidden', marginBottom: 0 }}>
            {[
              { text: 'Orchestrate', italic: false },
              { text: 'extraordinary', italic: false },
              { text: 'events.', italic: true, gold: true },
            ].map((line, i) => (
              <div key={i} style={{ overflow: 'hidden' }}>
                <motion.div
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: 'clamp(64px, 11vw, 152px)',
                      fontWeight: 900,
                      letterSpacing: '-5px',
                      lineHeight: 0.92,
                      color: line.gold ? ACCENT : '#fff',
                      fontStyle: line.italic ? 'italic' : 'normal',
                      marginBottom: '4px',
                    }}
                  >
                    {line.text}
                  </span>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: '16px',
              color: '#999',
              maxWidth: '440px',
              margin: '32px auto',
              lineHeight: 1.65,
            }}
          >
            The complete event planning platform for professionals who demand perfection.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              href="/register"
              style={{
                fontSize: '12px',
                letterSpacing: '0.18em',
                color: '#000',
                backgroundColor: '#fff',
                border: '1px solid #fff',
                padding: '14px 32px',
                textDecoration: 'none',
                fontWeight: 600,
              }}
              className="hover:opacity-85 transition-interactive"
            >
              ( PLAN YOUR EVENT )
            </Link>
            <Link
              href="/login"
              style={{
                fontSize: '12px',
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.6)',
                backgroundColor: 'transparent',
                padding: '14px 32px',
                textDecoration: 'none',
              }}
              className="hover:text-white transition-interactive"
            >
              ( SIGN IN )
            </Link>
          </motion.div>
        </div>

        {/* Floating 3D card — bottom right */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '5vw',
            transform: 'perspective(1000px) rotateX(15deg) rotateY(-10deg)',
            backgroundColor: '#111',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '24px',
            width: '220px',
          }}
          className="hidden lg:block"
          aria-hidden="true"
        >
          <p style={{ fontSize: '9px', letterSpacing: '0.22em', color: '#666', marginBottom: '14px' }}>LIVE STATS</p>
          {[
            { label: 'Events this month', value: '24' },
            { label: 'Guests confirmed', value: '1,847' },
            { label: 'Budget tracked', value: '$2.4M' },
          ].map((stat) => (
            <div key={stat.label} style={{ marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <p style={{ fontSize: '9px', color: '#555', letterSpacing: '0.1em', marginBottom: '2px' }}>{stat.label}</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{stat.value}</p>
            </div>
          ))}
          <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ACCENT }} />
            <span style={{ fontSize: '9px', color: ACCENT, letterSpacing: '0.1em' }}>ALL SYSTEMS LIVE</span>
          </div>
        </motion.div>
      </section>

      {/* ── MARQUEE STRIP ──────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#000',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          padding: '18px 0',
        }}
      >
        <div className="flex animate-marquee-land whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <span
              key={i}
              style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
            >
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '0.3em',
                  color: '#fff',
                  paddingRight: '48px',
                  whiteSpace: 'nowrap',
                }}
              >
                WEDDINGS — GALAS — CONFERENCES — BIRTHDAYS — CORPORATE — PRIVATE EVENTS — LUXURY CELEBRATIONS —
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ── PLATFORM OVERVIEW ──────────────────────────────────────────────── */}
      <section id="platform" style={{ backgroundColor: '#000', padding: '120px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            ref={platformReveal.ref}
            initial={{ opacity: 0, y: 24 }}
            animate={platformReveal.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p style={{ fontSize: '10px', letterSpacing: '0.4em', color: ACCENT, marginBottom: '64px' }}>
              THE PLATFORM
            </p>
          </motion.div>

          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}
            className="grid-cols-1 sm:grid-cols-3"
          >
            {[
              {
                num: '01',
                title: 'Guest Management',
                desc: 'Track every guest from invitation to check-in. RSVP management, dietary needs, seating charts, and real-time confirmations — all in one place.',
                icon: <Users size={20} color={ACCENT} aria-hidden="true" />,
              },
              {
                num: '02',
                title: 'Budget Control',
                desc: 'Set budgets, track actuals, and keep spending on target. Category breakdowns, vendor payments, and variance alerts keep you in control.',
                icon: <DollarSign size={20} color={ACCENT} aria-hidden="true" />,
              },
              {
                num: '03',
                title: 'Vendor Network',
                desc: 'Build your trusted vendor directory. Assign vendors to events, track contracts, and compare pricing across your entire professional network.',
                icon: <Building2 size={20} color={ACCENT} aria-hidden="true" />,
              },
            ].map((col, i) => (
              <motion.div
                key={col.num}
                initial={{ opacity: 0, y: 28 }}
                animate={platformReveal.inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                style={{
                  padding: '40px 32px',
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.1)' : undefined,
                  cursor: 'default',
                }}
              >
                <div style={{ marginBottom: '20px' }}>{col.icon}</div>
                <p style={{ fontSize: '10px', letterSpacing: '0.22em', color: '#444', marginBottom: '16px' }}>{col.num}</p>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                  {col.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.7 }}>{col.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE SHOWCASE ───────────────────────────────────────────────── */}
      <section id="features" ref={featuresReveal.ref} style={{ backgroundColor: '#000', padding: '0 40px 120px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '80px' }}>

          {/* Row 1: left card, right text */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={featuresReveal.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}
            className="grid-cols-1 lg:grid-cols-2"
          >
            {/* 3D card mockup */}
            <div
              style={{
                transform: 'perspective(800px) rotateX(8deg) rotateY(-12deg)',
                backgroundColor: '#0d0d0d',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '32px',
                minHeight: '320px',
                position: 'relative',
              }}
              aria-hidden="true"
            >
              <p style={{ fontSize: '9px', letterSpacing: '0.22em', color: '#444', marginBottom: '20px' }}>EVENT DASHBOARD</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Annual Gala 2026', 'Product Launch Q2', 'Executive Retreat', 'Team Summit'].map((name, i) => (
                  <div
                    key={name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      backgroundColor: i === 0 ? '#1a1a1a' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#ccc' }}>{name}</span>
                    <span style={{ fontSize: '9px', letterSpacing: '0.12em', color: i === 0 ? ACCENT : '#555' }}>
                      {['CONFIRMED', 'DRAFT', 'IN PROGRESS', 'PUBLISHED'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Text */}
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '0.25em', color: ACCENT, marginBottom: '20px' }}>01 — EVENTS</p>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '24px' }}>
                Create, manage, and track every event detail.
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Full event lifecycle management', 'Status tracking from draft to complete', 'Multi-timezone scheduling', 'Capacity and visibility controls'].map((item) => (
                  <li key={item} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ color: ACCENT, fontSize: '14px', marginTop: '1px' }}>—</span>
                    <span style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Row 2: left text, right card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={featuresReveal.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}
            className="grid-cols-1 lg:grid-cols-2"
          >
            {/* Text */}
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '0.25em', color: ACCENT, marginBottom: '20px' }}>02 — GUESTS</p>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '24px' }}>
                Every guest, perfectly managed.
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['RSVP tracking and reminders', 'Dietary and accessibility needs', 'Table and seat assignment', 'QR code check-in system'].map((item) => (
                  <li key={item} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ color: ACCENT, fontSize: '14px', marginTop: '1px' }}>—</span>
                    <span style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3D card mockup */}
            <div
              style={{
                transform: 'perspective(800px) rotateX(8deg) rotateY(12deg)',
                backgroundColor: '#0d0d0d',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '32px',
                minHeight: '320px',
              }}
              aria-hidden="true"
            >
              <p style={{ fontSize: '9px', letterSpacing: '0.22em', color: '#444', marginBottom: '20px' }}>GUEST LIST</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'Alexandra Chen', status: 'CONFIRMED' },
                  { name: 'Marcus Rivera', status: 'CONFIRMED' },
                  { name: 'Sophie Laurent', status: 'PENDING' },
                  { name: 'James Whitfield', status: 'DECLINED' },
                ].map((guest, i) => (
                  <div
                    key={guest.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      backgroundColor: i % 2 === 0 ? '#111' : 'transparent',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#ccc' }}>{guest.name}</span>
                    <span style={{
                      fontSize: '9px',
                      letterSpacing: '0.12em',
                      color: guest.status === 'CONFIRMED' ? '#5a9' : guest.status === 'DECLINED' ? '#a55' : '#a8956a',
                    }}>
                      {guest.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS COUNTER ──────────────────────────────────────────────────── */}
      <section
        ref={statsReveal.ref}
        style={{
          backgroundColor: '#fff',
          color: '#000',
          padding: '100px 40px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }} className="grid-cols-2 sm:grid-cols-4">
            {[
              { value: 2400, suffix: '+', label: 'events managed' },
              { value: 98, suffix: '%', label: 'client satisfaction' },
              { value: 150, suffix: '+', label: 'vendors connected' },
              { value: 24, suffix: '/7', label: 'support available' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={statsReveal.inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: '40px 24px',
                  borderRight: i < 3 ? '1px solid rgba(0,0,0,0.1)' : undefined,
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: 'clamp(48px, 5vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#000', lineHeight: 1 }}>
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </p>
                <p style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#888', marginTop: '10px', textTransform: 'uppercase' }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ─────────────────────────────────────────────────── */}
      <section
        id="pricing"
        ref={pricingReveal.ref}
        style={{ backgroundColor: '#000', padding: '120px 40px' }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={pricingReveal.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: '64px' }}
          >
            <h2
              style={{
                fontSize: 'clamp(52px, 8vw, 112px)',
                fontWeight: 900,
                letterSpacing: '-5px',
                lineHeight: 0.92,
                color: '#fff',
              }}
            >
              Simple pricing.
            </h2>
          </motion.div>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}
            className="grid-cols-1 sm:grid-cols-2"
          >
            {/* Starter */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={pricingReveal.inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                backgroundColor: '#111',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '40px',
              }}
            >
              <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#555', marginBottom: '24px' }}>STARTER</p>
              <p style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', marginBottom: '8px' }}>Free</p>
              <p style={{ fontSize: '13px', color: '#555', marginBottom: '32px' }}>Perfect for getting started</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Up to 3 events', '100 guests per event', 'Basic budget tracking', 'Email support'].map((f) => (
                  <li key={f} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ color: '#444', fontSize: '12px' }}>—</span>
                    <span style={{ fontSize: '14px', color: '#777' }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '12px 28px',
                  textDecoration: 'none',
                }}
                className="hover:border-white transition-interactive"
              >
                ( GET STARTED FREE )
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={pricingReveal.inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.18, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                backgroundColor: '#111',
                border: `1px solid ${ACCENT}`,
                padding: '40px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  fontSize: '9px',
                  letterSpacing: '0.22em',
                  color: '#000',
                  backgroundColor: ACCENT,
                  padding: '4px 10px',
                }}
              >
                POPULAR
              </div>
              <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: ACCENT, marginBottom: '24px' }}>PRO</p>
              <p style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', marginBottom: '4px' }}>$49</p>
              <p style={{ fontSize: '12px', color: '#555', marginBottom: '32px' }}>per month, billed annually</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Unlimited events', 'Unlimited guests', 'Advanced budget analytics', 'Vendor network access', 'Priority support', 'Custom branding'].map((f) => (
                  <li key={f} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ color: ACCENT, fontSize: '12px' }}>—</span>
                    <span style={{ fontSize: '14px', color: '#aaa' }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  color: '#000',
                  backgroundColor: ACCENT,
                  border: `1px solid ${ACCENT}`,
                  padding: '12px 28px',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
                className="cta-shimmer hover:opacity-90 transition-interactive"
              >
                ( START PRO TODAY )
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section
        id="contact"
        ref={ctaReveal.ref}
        style={{
          backgroundColor: '#fff',
          color: '#000',
          padding: '120px 40px',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={ctaReveal.inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2
            style={{
              fontSize: 'clamp(40px, 7vw, 100px)',
              fontWeight: 900,
              letterSpacing: '-4px',
              lineHeight: 0.95,
              color: '#000',
              marginBottom: '48px',
            }}
          >
            Ready to elevate<br />your events?
          </h2>
          <Link
            href="/register"
            style={{
              display: 'inline-block',
              fontSize: '12px',
              letterSpacing: '0.2em',
              color: '#fff',
              backgroundColor: '#000',
              border: '1px solid #000',
              padding: '16px 40px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
            className="cta-shimmer hover:opacity-80 transition-interactive"
          >
            ( START FREE TODAY )
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: '#000', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '80px 40px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '48px', marginBottom: '64px' }}
            className="grid-cols-2 sm:grid-cols-4"
          >
            {/* Brand */}
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '0.3em', color: '#fff', marginBottom: '12px' }}>EVENTFLOW</p>
              <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7, maxWidth: '200px' }}>
                The professional event planning platform for those who demand excellence.
              </p>
            </div>

            {/* Platform */}
            <div>
              <p style={{ fontSize: '9px', letterSpacing: '0.3em', color: '#444', marginBottom: '20px' }}>PLATFORM</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Events',  href: '/dashboard/events' },
                  { label: 'Guests',  href: '/dashboard/guests' },
                  { label: 'Budget',  href: '/dashboard/budget' },
                  { label: 'Vendors', href: '/dashboard/vendors' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }} className="hover:text-white transition-interactive">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p style={{ fontSize: '9px', letterSpacing: '0.3em', color: '#444', marginBottom: '20px' }}>COMPANY</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'About',   href: '#contact' },
                  { label: 'Blog',    href: '#contact' },
                  { label: 'Careers', href: '#contact' },
                  { label: 'Contact', href: '#contact' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }} className="hover:text-white transition-interactive">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p style={{ fontSize: '9px', letterSpacing: '0.3em', color: '#444', marginBottom: '20px' }}>LEGAL</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'].map((item) => (
                  <li key={item}>
                    <a href="#contact" style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }} className="hover:text-white transition-interactive">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <p style={{ fontSize: '11px', color: '#444', letterSpacing: '0.1em' }}>
              © EVENTFLOW 2026
            </p>
            <p style={{ fontSize: '11px', color: '#333', letterSpacing: '0.12em' }}>
              BUILT FOR EVENT PROFESSIONALS
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
