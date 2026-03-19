import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils'
import { createEventSchema, eventQuerySchema } from '@/lib/validations/event'
import { auditLog } from '@/lib/audit'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const parsed = eventQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query params' }, { status: 422 })
  }

  const { type, status, search, page, limit } = parsed.data
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  // Non-admin users only see their own events
  if (session.user.role !== 'SUPER_ADMIN') {
    where.OR = [
      { plannerId: session.user.id },
      { clientId: session.user.id },
    ]
  }

  if (type) where.type = type
  if (status) where.status = status
  if (search) {
    where.title = { contains: search }
  }

  const [events, total] = await Promise.all([
    db.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startDate: 'asc' },
      include: {
        venue: { select: { name: true, city: true } },
        planner: { select: { id: true, email: true } },
        _count: { select: { guests: true, tasks: true } },
      },
    }),
    db.event.count({ where }),
  ])

  return NextResponse.json({
    events,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!['SUPER_ADMIN', 'PLANNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createEventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 }
    )
  }

  const data = parsed.data
  const baseSlug = slugify(data.title)

  // Ensure unique slug
  let slug = baseSlug
  let counter = 0
  while (await db.event.findUnique({ where: { slug } })) {
    counter++
    slug = `${baseSlug}-${counter}`
  }

  const event = await db.event.create({
    data: {
      ...data,
      slug,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      plannerId: session.user.id,
    },
  })

  auditLog({
    userId: session.user.id,
    action: 'EVENT_CREATED',
    entity: 'Event',
    entityId: event.id,
    metadata: { title: event.title, type: event.type },
  })

  return NextResponse.json(event, { status: 201 })
}
