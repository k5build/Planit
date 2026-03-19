import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { encrypt, hmacHash } from '@/lib/crypto'
import { updateGuestSchema } from '@/lib/validations/guest'
import { auditLog } from '@/lib/audit'

interface RouteContext {
  params: Promise<{ id: string }>
}

async function resolveGuest(guestId: string, userId: string, isAdmin: boolean) {
  const guest = await db.guest.findUnique({
    where: { id: guestId },
    include: {
      event: { select: { plannerId: true, clientId: true } },
    },
  })

  if (!guest) return null

  if (
    !isAdmin &&
    guest.event.plannerId !== userId &&
    guest.event.clientId !== userId
  ) {
    return null
  }

  return guest
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const isAdmin = session.user.role === 'SUPER_ADMIN'

  const guest = await resolveGuest(id, session.user.id, isAdmin)
  if (!guest) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateGuestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 }
    )
  }

  const { firstName, lastName, email, phone, tags, ...rest } = parsed.data

  const updateData: Record<string, unknown> = { ...rest }

  if (firstName !== undefined) {
    updateData.firstNameEncrypted = encrypt(firstName)
  }
  if (lastName !== undefined) {
    updateData.lastNameEncrypted = encrypt(lastName)
  }
  if (email !== undefined) {
    updateData.emailEncrypted = encrypt(email)
    updateData.emailHash = hmacHash(email)
  }
  if (phone !== undefined) {
    updateData.phoneEncrypted = encrypt(phone)
    updateData.phoneHash = hmacHash(phone)
  }
  if (tags !== undefined) {
    updateData.tags = JSON.stringify(tags)
  }

  const updated = await db.guest.update({
    where: { id },
    data: updateData,
  })

  auditLog({
    userId: session.user.id,
    action: 'GUEST_UPDATED',
    entity: 'Guest',
    entityId: id,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const isAdmin = session.user.role === 'SUPER_ADMIN'

  const guest = await resolveGuest(id, session.user.id, isAdmin)
  if (!guest) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.guest.delete({ where: { id } })

  auditLog({
    userId: session.user.id,
    action: 'GUEST_DELETED',
    entity: 'Guest',
    entityId: id,
  })

  return new NextResponse(null, { status: 204 })
}
