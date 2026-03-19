import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateBudgetItemSchema } from '@/lib/validations/budget'
import { auditLog } from '@/lib/audit'

interface RouteContext {
  params: Promise<{ id: string }>
}

async function resolveBudgetItem(itemId: string, userId: string, isAdmin: boolean) {
  const item = await db.budgetItem.findUnique({
    where: { id: itemId },
    include: {
      event: { select: { plannerId: true, clientId: true } },
    },
  })

  if (!item) return null

  if (
    !isAdmin &&
    item.event.plannerId !== userId &&
    item.event.clientId !== userId
  ) {
    return null
  }

  return item
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const isAdmin = session.user.role === 'SUPER_ADMIN'

  const item = await resolveBudgetItem(id, session.user.id, isAdmin)
  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateBudgetItemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 }
    )
  }

  const updated = await db.budgetItem.update({
    where: { id },
    data: parsed.data,
  })

  auditLog({
    userId: session.user.id,
    action: 'BUDGET_ITEM_UPDATED',
    entity: 'BudgetItem',
    entityId: id,
    metadata: { category: updated.category, planned: updated.planned },
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

  const item = await resolveBudgetItem(id, session.user.id, isAdmin)
  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.budgetItem.delete({ where: { id } })

  auditLog({
    userId: session.user.id,
    action: 'BUDGET_ITEM_DELETED',
    entity: 'BudgetItem',
    entityId: id,
  })

  return new NextResponse(null, { status: 204 })
}
