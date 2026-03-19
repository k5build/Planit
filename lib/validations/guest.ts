import { z } from 'zod'

export const createGuestSchema = z.object({
  eventId: z.string().cuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  rsvpStatus: z.enum(['PENDING', 'CONFIRMED', 'DECLINED', 'WAITLISTED', 'NO_SHOW']).default('PENDING'),
  dietaryNeeds: z.string().max(500).optional(),
  accessNeeds: z.string().max(500).optional(),
  plusOnes: z.number().int().min(0).max(10).default(0),
  tableNumber: z.string().optional(),
  seatNumber: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
  ticketId: z.string().optional(),
})

export const updateGuestSchema = createGuestSchema.partial()

export const guestQuerySchema = z.object({
  eventId: z.string().cuid().optional(),
  rsvpStatus: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export type CreateGuestInput = z.infer<typeof createGuestSchema>
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>
