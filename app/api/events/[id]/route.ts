import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateEventSchema } from '@/lib/validations/event'
import { auditLog } from '@/lib/audit'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const event = await db.event.findUnique({
    where: { id },
    include: {
      venue: true,
      planner: { select: { id: true, email: true } },
      client: { select: { id: true, email: true } },
      vendors: { include: { vendor: true } },
      _count: { select: { guests: true, tasks: true, budgetItems: true } },
    },
  })

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  // RBAC: non-admins can only see their own events
  if (
    session.user.role !== 'SUPER_ADMIN' &&
    event.plannerId !== session.user.id &&
    event.clientId !== session.user.id
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(event)
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const event = await db.event.findUnique({ where: { id } })
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  if (
    session.user.role !== 'SUPER_ADMIN' &&
    event.plannerId !== session.user.id
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateEventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 }
    )
  }

  const data = parsed.data
  const updated = await db.event.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
    },
  })

  auditLog({
    userId: session.user.id,
    action: 'EVENT_UPDATED',
    entity: 'Event',
    entityId: id,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const event = await db.event.findUnique({ where: { id } })
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  if (
    session.user.role !== 'SUPER_ADMIN' &&
    event.plannerId !== session.user.id
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.event.delete({ where: { id } })

  auditLog({
    userId: session.user.id,
    action: 'EVENT_DELETED',
    entity: 'Event',
    entityId: id,
  })

  return NextResponse.json({ success: true })
}
