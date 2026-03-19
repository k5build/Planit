import { z } from 'zod'

export const createBudgetItemSchema = z.object({
  eventId: z.string().cuid(),
  category: z.enum([
    'VENUE', 'CATERING', 'MUSIC', 'PHOTOGRAPHY', 'FLORIST',
    'DECORATION', 'TRANSPORTATION', 'STAFFING', 'MARKETING',
    'PRINTING', 'TECHNOLOGY', 'MISCELLANEOUS',
  ]),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  planned: z.number().positive(),
  actual: z.number().nonnegative().optional(),
  currency: z.string().length(3).default('USD'),
  vendorId: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

export const updateBudgetItemSchema = createBudgetItemSchema.partial()

export type CreateBudgetItemInput = z.infer<typeof createBudgetItemSchema>
export type UpdateBudgetItemInput = z.infer<typeof updateBudgetItemSchema>
