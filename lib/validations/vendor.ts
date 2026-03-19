import { z } from 'zod'

export const createVendorSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.enum([
    'CATERING', 'PHOTOGRAPHY', 'VIDEOGRAPHY', 'MUSIC', 'FLORIST',
    'DECORATION', 'LIGHTING', 'AUDIO_VISUAL', 'TRANSPORTATION',
    'SECURITY', 'CLEANING', 'ENTERTAINMENT', 'VENUE', 'OFFICIANT',
    'STATIONERY', 'OTHER',
  ]),
  description: z.string().max(2000).optional(),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  priceRangeMin: z.number().positive().optional(),
  priceRangeMax: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  tags: z.array(z.string()).optional(),
})

export const updateVendorSchema = createVendorSchema.partial()

export const vendorQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateVendorInput = z.infer<typeof createVendorSchema>
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>
