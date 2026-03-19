import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  type: z.enum([
    'WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONFERENCE',
    'EXHIBITION', 'GALA', 'WORKSHOP', 'PRIVATE', 'OTHER',
  ]),
  status: z.enum([
    'DRAFT', 'PUBLISHED', 'CONFIRMED', 'IN_PROGRESS',
    'COMPLETED', 'CANCELLED', 'POSTPONED',
  ]).default('DRAFT'),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).default('PRIVATE'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timezone: z.string().default('UTC'),
  maxCapacity: z.number().int().positive().optional(),
  expectedGuests: z.number().int().positive().optional(),
  budgetTotal: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  venueId: z.string().optional(),
  clientId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(320).optional(),
})

export const updateEventSchema = createEventSchema.partial()

export const eventQuerySchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
