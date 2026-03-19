import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import { createHmac, randomBytes, createCipheriv } from 'crypto'
import path from 'node:path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
const db = new PrismaClient({ adapter })

const ENCRYPTION_KEY_HEX = '0000000000000000000000000000000000000000000000000000000000000001'
const HMAC_SECRET = 'change-me-hmac-secret-32chars-min'

function encrypt(plaintext: string): string {
  const key = Buffer.from(ENCRYPTION_KEY_HEX, 'hex')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':')
}

function hmacHash(value: string): string {
  return createHmac('sha256', HMAC_SECRET).update(value.toLowerCase()).digest('hex')
}

async function main() {
  console.log('🌱 Seeding EventFlow demo data...')

  // Clear existing data
  await db.auditLog.deleteMany()
  await db.notification.deleteMany()
  await db.message.deleteMany()
  await db.checkIn.deleteMany()
  await db.feedbackResponse.deleteMany()
  await db.survey.deleteMany()
  await db.campaignLink.deleteMany()
  await db.document.deleteMany()
  await db.floorPlan.deleteMany()
  await db.invoiceLineItem.deleteMany()
  await db.invoice.deleteMany()
  await db.contract.deleteMany()
  await db.proposal.deleteMany()
  await db.task.deleteMany()
  await db.budgetItem.deleteMany()
  await db.guest.deleteMany()
  await db.ticket.deleteMany()
  await db.eventVendor.deleteMany()
  await db.event.deleteMany()
  await db.vendor.deleteMany()
  await db.venueAvailability.deleteMany()
  await db.venue.deleteMany()
  await db.user.deleteMany()
  await db.organization.deleteMany()

  // ── Organization ────────────────────────────────────────────────────────────
  const org = await db.organization.create({
    data: {
      name: 'EventFlow Co.',
      slug: 'eventflow',
      brandColor: '#7C3AED',
      website: 'https://eventflow.com',
      phone: '+1 (555) 000-0001',
    },
  })

  // ── Users ────────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Demo1234!', 12)

  const admin = await db.user.create({
    data: {
      email: 'admin@eventflow.com',
      emailHash: hmacHash('admin@eventflow.com'),
      passwordHash,
      nameEncrypted: encrypt('Alex Morgan'),
      role: 'SUPER_ADMIN',
      organizationId: org.id,
      tokenVersion: 0,
      isActive: true,
      lastLoginAt: new Date(),
    },
  })

  const planner = await db.user.create({
    data: {
      email: 'planner@eventflow.com',
      emailHash: hmacHash('planner@eventflow.com'),
      passwordHash,
      nameEncrypted: encrypt('Sarah Johnson'),
      role: 'PLANNER',
      organizationId: org.id,
      tokenVersion: 0,
      isActive: true,
    },
  })

  const client1 = await db.user.create({
    data: {
      email: 'client@eventflow.com',
      emailHash: hmacHash('client@eventflow.com'),
      passwordHash,
      nameEncrypted: encrypt('Michael & Emma Chen'),
      phoneEncrypted: encrypt('+1 (555) 123-4567'),
      phoneHash: hmacHash('+15551234567'),
      role: 'CLIENT',
      organizationId: org.id,
      tokenVersion: 0,
      isActive: true,
    },
  })

  await db.user.create({
    data: {
      email: 'finance@eventflow.com',
      emailHash: hmacHash('finance@eventflow.com'),
      passwordHash,
      nameEncrypted: encrypt('David Kim'),
      role: 'FINANCE',
      organizationId: org.id,
      tokenVersion: 0,
      isActive: true,
    },
  })

  // ── Venues ───────────────────────────────────────────────────────────────────
  const venue1 = await db.venue.create({
    data: {
      name: 'The Grand Pavilion',
      slug: 'grand-pavilion',
      description: 'A stunning waterfront venue with panoramic views, perfect for weddings and galas.',
      city: 'New York',
      country: 'USA',
      capacity: 500,
      indoorCapacity: 300,
      outdoorCapacity: 200,
      pricePerDay: 8500,
      currency: 'USD',
      amenities: JSON.stringify(['Catering Kitchen', 'Bridal Suite', 'AV System', 'Valet Parking', 'Garden Terrace']),
      rating: 4.9,
      isActive: true,
    },
  })

  const venue2 = await db.venue.create({
    data: {
      name: 'Skyline Conference Center',
      slug: 'skyline-conference',
      description: 'Modern corporate venue with state-of-the-art tech, flexible spaces, and city views.',
      city: 'New York',
      country: 'USA',
      capacity: 800,
      indoorCapacity: 800,
      pricePerDay: 12000,
      currency: 'USD',
      amenities: JSON.stringify(['AV Equipment', 'High-Speed WiFi', 'Breakout Rooms', 'Catering', 'Parking']),
      rating: 4.7,
      isActive: true,
    },
  })

  const venue3 = await db.venue.create({
    data: {
      name: 'Rosewood Garden Estate',
      slug: 'rosewood-garden',
      description: 'Romantic countryside estate with manicured gardens, ideal for intimate celebrations.',
      city: 'The Hamptons',
      country: 'USA',
      capacity: 200,
      indoorCapacity: 120,
      outdoorCapacity: 200,
      pricePerDay: 5500,
      currency: 'USD',
      amenities: JSON.stringify(['Garden Ceremony Space', 'Manor House', 'Catering', 'Accommodation', 'Parking']),
      rating: 4.8,
      isActive: true,
    },
  })

  // ── Vendors ───────────────────────────────────────────────────────────────────
  const vendor1 = await db.vendor.create({
    data: {
      name: 'Harmony Catering Co.',
      category: 'CATERING',
      description: 'Award-winning catering with customized menus for every occasion.',
      emailEncrypted: encrypt('hello@harmonycatering.com'),
      emailHash: hmacHash('hello@harmonycatering.com'),
      priceRangeMin: 5000,
      priceRangeMax: 50000,
      currency: 'USD',
      rating: 4.8,
      reviewCount: 124,
      isVerified: true,
      isActive: true,
    },
  })

  const vendor2 = await db.vendor.create({
    data: {
      name: 'Lumière Photography',
      category: 'PHOTOGRAPHY',
      description: 'Luxury wedding and event photography capturing timeless moments.',
      emailEncrypted: encrypt('studio@lumiere.com'),
      emailHash: hmacHash('studio@lumiere.com'),
      priceRangeMin: 3500,
      priceRangeMax: 15000,
      currency: 'USD',
      rating: 5.0,
      reviewCount: 89,
      isVerified: true,
      isActive: true,
    },
  })

  const vendor3 = await db.vendor.create({
    data: {
      name: 'Bloom & Wild Florals',
      category: 'FLORIST',
      description: 'Bespoke floral design creating stunning arrangements and installations.',
      emailEncrypted: encrypt('orders@bloomwild.com'),
      emailHash: hmacHash('orders@bloomwild.com'),
      priceRangeMin: 2000,
      priceRangeMax: 30000,
      currency: 'USD',
      rating: 4.9,
      reviewCount: 67,
      isVerified: true,
      isActive: true,
    },
  })

  const vendor4 = await db.vendor.create({
    data: {
      name: 'SoundWave Entertainment',
      category: 'MUSIC',
      description: 'Live bands, DJs, and full AV production for every event style.',
      emailEncrypted: encrypt('book@soundwave.com'),
      emailHash: hmacHash('book@soundwave.com'),
      priceRangeMin: 1500,
      priceRangeMax: 20000,
      currency: 'USD',
      rating: 4.7,
      reviewCount: 203,
      isVerified: true,
      isActive: true,
    },
  })

  // ── Events ───────────────────────────────────────────────────────────────────
  const weddingDate = new Date('2026-06-14T16:00:00Z')
  const weddingEnd = new Date('2026-06-14T23:59:00Z')

  const wedding = await db.event.create({
    data: {
      title: 'Chen & Williams Wedding',
      slug: 'chen-williams-wedding-2026',
      description: 'An elegant garden wedding ceremony and reception for 180 guests.',
      type: 'WEDDING',
      status: 'CONFIRMED',
      visibility: 'PRIVATE',
      startDate: weddingDate,
      endDate: weddingEnd,
      timezone: 'America/New_York',
      maxCapacity: 200,
      expectedGuests: 180,
      budgetTotal: 85000,
      currency: 'USD',
      plannerId: planner.id,
      clientId: client1.id,
      venueId: venue3.id,
      organizationId: org.id,
      tags: JSON.stringify(['wedding', 'luxury', 'garden']),
    },
  })

  const confDate = new Date('2026-04-22T09:00:00Z')
  const confEnd = new Date('2026-04-22T18:00:00Z')

  const conference = await db.event.create({
    data: {
      title: 'Tech Horizons Summit 2026',
      slug: 'tech-horizons-summit-2026',
      description: 'Annual technology conference bringing together 600+ industry leaders.',
      type: 'CONFERENCE',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      startDate: confDate,
      endDate: confEnd,
      timezone: 'America/New_York',
      maxCapacity: 650,
      expectedGuests: 600,
      budgetTotal: 120000,
      currency: 'USD',
      plannerId: admin.id,
      venueId: venue2.id,
      organizationId: org.id,
      tags: JSON.stringify(['conference', 'technology', 'corporate']),
    },
  })

  const galaDate = new Date('2026-05-10T19:00:00Z')
  const galaEnd = new Date('2026-05-11T01:00:00Z')

  const gala = await db.event.create({
    data: {
      title: 'Charity Gala Night 2026',
      slug: 'charity-gala-night-2026',
      description: 'Black-tie charity gala dinner with live auction and entertainment.',
      type: 'GALA',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      startDate: galaDate,
      endDate: galaEnd,
      timezone: 'America/New_York',
      maxCapacity: 300,
      expectedGuests: 280,
      budgetTotal: 95000,
      currency: 'USD',
      plannerId: planner.id,
      venueId: venue1.id,
      organizationId: org.id,
      tags: JSON.stringify(['gala', 'charity', 'black-tie']),
    },
  })

  const birthdayDate = new Date('2026-04-05T18:00:00Z')
  const birthdayEnd = new Date('2026-04-05T22:00:00Z')

  const birthday = await db.event.create({
    data: {
      title: 'Sophia\'s 30th Birthday Celebration',
      slug: 'sophia-30th-birthday-2026',
      description: 'Intimate birthday dinner and dancing for 50 close friends and family.',
      type: 'BIRTHDAY',
      status: 'DRAFT',
      visibility: 'PRIVATE',
      startDate: birthdayDate,
      endDate: birthdayEnd,
      timezone: 'America/New_York',
      maxCapacity: 60,
      expectedGuests: 50,
      budgetTotal: 15000,
      currency: 'USD',
      plannerId: planner.id,
      venueId: venue1.id,
      organizationId: org.id,
    },
  })

  // ── Assign Vendors to Events ──────────────────────────────────────────────────
  await db.eventVendor.createMany({
    data: [
      { eventId: wedding.id, vendorId: vendor1.id, role: 'Catering', fee: 18000 },
      { eventId: wedding.id, vendorId: vendor2.id, role: 'Photography', fee: 6500 },
      { eventId: wedding.id, vendorId: vendor3.id, role: 'Florals', fee: 9000 },
      { eventId: wedding.id, vendorId: vendor4.id, role: 'Live Band', fee: 8000 },
      { eventId: gala.id, vendorId: vendor1.id, role: 'Catering', fee: 28000 },
      { eventId: gala.id, vendorId: vendor4.id, role: 'Entertainment', fee: 12000 },
      { eventId: conference.id, vendorId: vendor4.id, role: 'AV Production', fee: 15000 },
      { eventId: conference.id, vendorId: vendor1.id, role: 'Catering', fee: 25000 },
    ],
  })

  // ── Tickets ──────────────────────────────────────────────────────────────────
  await db.ticket.createMany({
    data: [
      {
        eventId: conference.id,
        name: 'General Admission',
        description: 'Full day access to all sessions and networking lunch',
        price: 299,
        currency: 'USD',
        quantity: 500,
        sold: 342,
        status: 'ACTIVE',
        saleStartAt: new Date('2026-01-01'),
        saleEndAt: confDate,
      },
      {
        eventId: conference.id,
        name: 'VIP Pass',
        description: 'Priority seating, speaker dinner, and exclusive lounge access',
        price: 799,
        currency: 'USD',
        quantity: 100,
        sold: 87,
        status: 'ACTIVE',
        saleStartAt: new Date('2026-01-01'),
        saleEndAt: confDate,
      },
      {
        eventId: gala.id,
        name: 'Gala Table (10 seats)',
        description: 'Reserved table for 10 with premium menu and open bar',
        price: 5000,
        currency: 'USD',
        quantity: 28,
        sold: 22,
        status: 'ACTIVE',
        saleStartAt: new Date('2026-02-01'),
        saleEndAt: galaDate,
      },
    ],
  })

  // ── Guests ───────────────────────────────────────────────────────────────────
  const guestData = [
    { firstName: 'James', lastName: 'Chen', email: 'james.chen@example.com', rsvp: 'CONFIRMED' as const },
    { firstName: 'Olivia', lastName: 'Williams', email: 'olivia.w@example.com', rsvp: 'CONFIRMED' as const },
    { firstName: 'Robert', lastName: 'Martinez', email: 'robert.m@example.com', rsvp: 'CONFIRMED' as const },
    { firstName: 'Sophia', lastName: 'Lee', email: 'sophia.l@example.com', rsvp: 'PENDING' as const },
    { firstName: 'William', lastName: 'Davis', email: 'will.d@example.com', rsvp: 'DECLINED' as const },
    { firstName: 'Isabella', lastName: 'Brown', email: 'isabella.b@example.com', rsvp: 'CONFIRMED' as const },
    { firstName: 'Ethan', lastName: 'Wilson', email: 'ethan.w@example.com', rsvp: 'CONFIRMED' as const },
    { firstName: 'Mia', lastName: 'Taylor', email: 'mia.t@example.com', rsvp: 'PENDING' as const },
  ]

  for (const g of guestData) {
    await db.guest.create({
      data: {
        eventId: wedding.id,
        firstNameEncrypted: encrypt(g.firstName),
        lastNameEncrypted: encrypt(g.lastName),
        emailEncrypted: encrypt(g.email),
        emailHash: hmacHash(g.email),
        rsvpStatus: g.rsvp,
        qrCode: `QR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        rsvpToken: randomBytes(16).toString('hex'),
        invitedAt: new Date(),
        ...(g.rsvp === 'CONFIRMED' ? { rsvpAt: new Date() } : {}),
      },
    })
  }

  // ── Budget Items ──────────────────────────────────────────────────────────────
  await db.budgetItem.createMany({
    data: [
      { eventId: wedding.id, category: 'VENUE', name: 'Rosewood Garden Estate', planned: 5500, actual: 5500, currency: 'USD' },
      { eventId: wedding.id, category: 'CATERING', name: 'Harmony Catering Co.', planned: 18000, actual: 18000, currency: 'USD' },
      { eventId: wedding.id, category: 'PHOTOGRAPHY', name: 'Lumière Photography', planned: 6500, actual: 6500, currency: 'USD' },
      { eventId: wedding.id, category: 'FLORIST', name: 'Bloom & Wild Florals', planned: 9000, actual: 7800, currency: 'USD' },
      { eventId: wedding.id, category: 'MUSIC', name: 'SoundWave Live Band', planned: 8000, actual: null, currency: 'USD' },
      { eventId: wedding.id, category: 'DECORATION', name: 'Lighting & Draping', planned: 4500, actual: 4200, currency: 'USD' },
      { eventId: wedding.id, category: 'TRANSPORTATION', name: 'Guest Shuttle Service', planned: 2000, actual: null, currency: 'USD' },
      { eventId: wedding.id, category: 'STAFFING', name: 'Event Day Staff (8)', planned: 3200, actual: null, currency: 'USD' },
      { eventId: wedding.id, category: 'PRINTING', name: 'Invitations & Stationery', planned: 1800, actual: 1650, currency: 'USD' },
      { eventId: wedding.id, category: 'MISCELLANEOUS', name: 'Contingency Fund', planned: 5000, actual: null, currency: 'USD' },

      { eventId: conference.id, category: 'VENUE', name: 'Skyline Conference Center', planned: 12000, actual: 12000, currency: 'USD' },
      { eventId: conference.id, category: 'CATERING', name: 'Harmony Catering Co.', planned: 25000, actual: 22500, currency: 'USD' },
      { eventId: conference.id, category: 'TECHNOLOGY', name: 'SoundWave AV Production', planned: 15000, actual: 15000, currency: 'USD' },
      { eventId: conference.id, category: 'MARKETING', name: 'Digital Campaign', planned: 8000, actual: 7200, currency: 'USD' },
      { eventId: conference.id, category: 'PRINTING', name: 'Badges & Materials', planned: 3500, actual: null, currency: 'USD' },
      { eventId: conference.id, category: 'STAFFING', name: 'Event Staff & Security', planned: 12000, actual: null, currency: 'USD' },

      { eventId: gala.id, category: 'VENUE', name: 'The Grand Pavilion', planned: 8500, actual: 8500, currency: 'USD' },
      { eventId: gala.id, category: 'CATERING', name: 'Premium Gala Dinner', planned: 28000, actual: null, currency: 'USD' },
      { eventId: gala.id, category: 'MUSIC', name: 'Live Orchestra + DJ', planned: 12000, actual: null, currency: 'USD' },
      { eventId: gala.id, category: 'DECORATION', name: 'Black-Tie Décor Package', planned: 15000, actual: null, currency: 'USD' },
    ],
  })

  // ── Tasks ─────────────────────────────────────────────────────────────────────
  await db.task.createMany({
    data: [
      { eventId: wedding.id, assignedToId: planner.id, title: 'Confirm final guest count with client', status: 'DONE', priority: 'HIGH', dueDate: new Date('2026-05-01'), completedAt: new Date('2026-04-28') },
      { eventId: wedding.id, assignedToId: planner.id, title: 'Finalize catering menu selections', status: 'DONE', priority: 'HIGH', dueDate: new Date('2026-05-15'), completedAt: new Date('2026-05-10') },
      { eventId: wedding.id, assignedToId: planner.id, title: 'Coordinate florist delivery time', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: new Date('2026-06-01') },
      { eventId: wedding.id, assignedToId: planner.id, title: 'Send seating chart to venue', status: 'TODO', priority: 'HIGH', dueDate: new Date('2026-06-07') },
      { eventId: wedding.id, assignedToId: planner.id, title: 'Confirm transportation schedule', status: 'TODO', priority: 'MEDIUM', dueDate: new Date('2026-06-10') },
      { eventId: wedding.id, assignedToId: planner.id, title: 'Final vendor briefing calls', status: 'TODO', priority: 'CRITICAL', dueDate: new Date('2026-06-12') },

      { eventId: conference.id, assignedToId: admin.id, title: 'Publish speaker lineup on event page', status: 'DONE', priority: 'HIGH', completedAt: new Date() },
      { eventId: conference.id, assignedToId: admin.id, title: 'Set up registration form & ticketing', status: 'DONE', priority: 'CRITICAL', completedAt: new Date() },
      { eventId: conference.id, assignedToId: planner.id, title: 'Coordinate AV setup walkthrough', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: new Date('2026-04-15') },
      { eventId: conference.id, assignedToId: planner.id, title: 'Prepare attendee badges', status: 'TODO', priority: 'MEDIUM', dueDate: new Date('2026-04-18') },

      { eventId: gala.id, assignedToId: planner.id, title: 'Design and send invitations', status: 'DONE', priority: 'HIGH', completedAt: new Date() },
      { eventId: gala.id, assignedToId: planner.id, title: 'Confirm charity auction items', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: new Date('2026-04-30') },
      { eventId: gala.id, assignedToId: planner.id, title: 'Finalize black-tie décor package', status: 'TODO', priority: 'MEDIUM', dueDate: new Date('2026-05-01') },
    ],
  })

  // ── Invoices ──────────────────────────────────────────────────────────────────
  const invoice1 = await db.invoice.create({
    data: {
      eventId: wedding.id,
      clientId: client1.id,
      number: 'INV-2026-001',
      status: 'PAID',
      subtotal: 25000,
      tax: 2000,
      discount: 0,
      total: 27000,
      currency: 'USD',
      dueDate: new Date('2026-03-01'),
      paidAt: new Date('2026-02-28'),
      notes: 'Deposit — 30% of total event package',
    },
  })

  await db.invoiceLineItem.createMany({
    data: [
      { invoiceId: invoice1.id, description: 'Event Planning & Coordination (30% Deposit)', quantity: 1, unitPrice: 20000, total: 20000 },
      { invoiceId: invoice1.id, description: 'Venue Booking Fee', quantity: 1, unitPrice: 5000, total: 5000 },
    ],
  })

  const invoice2 = await db.invoice.create({
    data: {
      eventId: wedding.id,
      clientId: client1.id,
      number: 'INV-2026-002',
      status: 'SENT',
      subtotal: 42000,
      tax: 3360,
      discount: 2000,
      total: 43360,
      currency: 'USD',
      dueDate: new Date('2026-05-15'),
      notes: 'Balance — Catering, Photography, Florals',
    },
  })

  await db.invoiceLineItem.createMany({
    data: [
      { invoiceId: invoice2.id, description: 'Harmony Catering Co. — Wedding Package', quantity: 1, unitPrice: 18000, total: 18000 },
      { invoiceId: invoice2.id, description: 'Lumière Photography — Full Day Coverage', quantity: 1, unitPrice: 6500, total: 6500 },
      { invoiceId: invoice2.id, description: 'Bloom & Wild Florals — Full Package', quantity: 1, unitPrice: 9000, total: 9000 },
      { invoiceId: invoice2.id, description: 'Loyalty Discount', quantity: 1, unitPrice: -2000, total: -2000 },
    ],
  })

  const invoice3 = await db.invoice.create({
    data: {
      eventId: conference.id,
      clientId: admin.id,
      number: 'INV-2026-003',
      status: 'OVERDUE',
      subtotal: 55000,
      tax: 4400,
      discount: 0,
      total: 59400,
      currency: 'USD',
      dueDate: new Date('2026-03-10'),
      notes: 'Tech Horizons Summit — Venue, AV, Catering',
    },
  })

  await db.invoiceLineItem.createMany({
    data: [
      { invoiceId: invoice3.id, description: 'Skyline Conference Center — Full Day', quantity: 1, unitPrice: 12000, total: 12000 },
      { invoiceId: invoice3.id, description: 'SoundWave AV Production', quantity: 1, unitPrice: 15000, total: 15000 },
      { invoiceId: invoice3.id, description: 'Harmony Catering — Conference Package', quantity: 1, unitPrice: 25000, total: 25000 },
      { invoiceId: invoice3.id, description: 'Event Management Fee', quantity: 1, unitPrice: 3000, total: 3000 },
    ],
  })

  // ── Notifications ─────────────────────────────────────────────────────────────
  await db.notification.createMany({
    data: [
      { userId: admin.id, type: 'WARNING', title: 'Invoice Overdue', body: 'INV-2026-003 is overdue by 9 days. Follow up with client.', actionUrl: '/dashboard/budget' },
      { userId: admin.id, type: 'SUCCESS', title: 'Payment Received', body: 'INV-2026-001 has been paid. $27,000 received.', actionUrl: '/dashboard/budget', isRead: true },
      { userId: admin.id, type: 'INFO', title: 'New Event Inquiry', body: 'A new event inquiry has been submitted via the booking form.', actionUrl: '/dashboard/events' },
      { userId: planner.id, type: 'INFO', title: 'Task Due Soon', body: 'Coordinate florist delivery time is due in 2 weeks.', actionUrl: '/dashboard/events' },
      { userId: planner.id, type: 'SUCCESS', title: 'Guest RSVP Confirmed', body: '6 of 8 wedding guests have confirmed attendance.', actionUrl: '/dashboard/guests', isRead: true },
    ],
  })

  // ── Floor Plan ────────────────────────────────────────────────────────────────
  await db.floorPlan.create({
    data: {
      eventId: wedding.id,
      name: 'Reception Layout v2',
      version: 2,
      isActive: true,
      data: JSON.stringify({
        width: 1200,
        height: 800,
        tables: [
          { id: 't1', label: 'Head Table', x: 550, y: 100, seats: 10, shape: 'rectangle' },
          { id: 't2', label: 'Table 1', x: 150, y: 300, seats: 8, shape: 'round' },
          { id: 't3', label: 'Table 2', x: 350, y: 300, seats: 8, shape: 'round' },
          { id: 't4', label: 'Table 3', x: 550, y: 300, seats: 8, shape: 'round' },
          { id: 't5', label: 'Table 4', x: 750, y: 300, seats: 8, shape: 'round' },
          { id: 't6', label: 'Table 5', x: 950, y: 300, seats: 8, shape: 'round' },
          { id: 't7', label: 'Table 6', x: 250, y: 500, seats: 8, shape: 'round' },
          { id: 't8', label: 'Table 7', x: 550, y: 500, seats: 8, shape: 'round' },
          { id: 't9', label: 'Table 8', x: 850, y: 500, seats: 8, shape: 'round' },
        ],
        zones: [
          { id: 'z1', label: 'Dance Floor', x: 400, y: 650, width: 400, height: 120 },
          { id: 'z2', label: 'Bar', x: 50, y: 650, width: 200, height: 100 },
        ],
      }),
    },
  })

  // ── Messages ──────────────────────────────────────────────────────────────────
  await db.message.createMany({
    data: [
      { eventId: wedding.id, senderId: planner.id, type: 'CLIENT', subject: 'Final Menu Confirmation', body: 'Hi! The catering team has confirmed your menu selections. Everything looks perfect for the big day!', isRead: true },
      { eventId: wedding.id, senderId: client1.id, type: 'CLIENT', subject: 'RE: Final Menu Confirmation', body: 'Wonderful, thank you! Could we add one more vegetarian option for table 3?', isRead: true },
      { eventId: wedding.id, senderId: planner.id, type: 'INTERNAL', subject: 'Vendor Status Update', body: 'Catering and photography are confirmed. Still waiting on final quote from florist.', isRead: false },
    ],
  })

  console.log('✅ Demo seed complete!')
  console.log('')
  console.log('── Demo Credentials ──────────────────────────────')
  console.log('  Super Admin:  admin@eventflow.com   / Demo1234!')
  console.log('  Planner:      planner@eventflow.com / Demo1234!')
  console.log('  Client:       client@eventflow.com  / Demo1234!')
  console.log('  Finance:      finance@eventflow.com / Demo1234!')
  console.log('─────────────────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
