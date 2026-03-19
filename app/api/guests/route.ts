import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { encrypt, hmacHash, generateToken } from '@/lib/crypto'
import { createGuestSchema, guestQuerySchema } from '@/lib/validations/guest'
import { auditLog } from '@/lib/audit'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const parsed = guestQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 422 })
  }

  const { eventId, rsvpStatus, page, limit } = parsed.data
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (eventId) where.eventId = eventId
  if (rsvpStatus) where.rsvpStatus = rsvpStatus

  const [guests, total] = await Promise.all([
    db.guest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.guest.count({ where }),
  ])

  return NextResponse.json({
    guests,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createGuestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 }
    )
  }

  const { firstName, lastName, email, phone, tags, ...rest } = parsed.data

  const guest = await db.guest.create({
    data: {
      ...rest,
      firstNameEncrypted: encrypt(firstName),
      lastNameEncrypted: encrypt(lastName),
      emailEncrypted: encrypt(email),
      emailHash: hmacHash(email),
      phoneEncrypted: phone ? encrypt(phone) : undefined,
      phoneHash: phone ? hmacHash(phone) : undefined,
      rsvpToken: generateToken(24),
      qrCode: generateToken(32),
      tags: tags ? JSON.stringify(tags) : undefined,
    },
  })

  auditLog({
    userId: session.user.id,
    action: 'GUEST_CREATED',
    entity: 'Guest',
    entityId: guest.id,
  })

  return NextResponse.json(guest, { status: 201 })
}
