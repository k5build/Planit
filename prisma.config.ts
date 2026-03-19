import { defineConfig } from 'prisma/config'
import path from 'node:path'

const isTurso = !!process.env.DATABASE_AUTH_TOKEN
const dbUrl = isTurso
  ? process.env.DATABASE_URL!
  : `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: dbUrl,
  },
})
