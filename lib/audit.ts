import { db } from '@/lib/db'
import { maskPhone } from '@/lib/crypto'

interface AuditParams {
  userId?: string
  action: string
  entity?: string
  entityId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Non-blocking audit log writer. Masks sensitive PII fields.
 */
export function auditLog(params: AuditParams): void {
  const sanitized = params.metadata ? sanitizeMetadata(params.metadata) : undefined
  // Fire and forget — never block the main request
  void db.auditLog
    .create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: sanitized ? JSON.stringify(sanitized) : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
    .catch((err: unknown) => {
      console.error('[audit] Failed to write log:', err)
    })
}

function sanitizeMetadata(
  meta: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(meta)) {
    if (
      key.toLowerCase().includes('phone') &&
      typeof value === 'string'
    ) {
      result[key] = maskPhone(value)
    } else if (
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('token')
    ) {
      result[key] = '[REDACTED]'
    } else {
      result[key] = value
    }
  }
  return result
}
