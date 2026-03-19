import { defineConfig } from 'prisma/config'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'node:path'

const isTurso = !!process.env.DATABASE_AUTH_TOKEN
const dbUrl = isTurso
  ? process.env.DATABASE_URL!
  : `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  datasource: {
    url: dbUrl,
  },
  migrate: {
    adapter: () =>
      new PrismaLibSql(
        isTurso
          ? { url: dbUrl, authToken: process.env.DATABASE_AUTH_TOKEN! }
          : { url: dbUrl }
      ),
  },
})
