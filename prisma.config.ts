import { defineConfig } from 'prisma/config'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'node:path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const dbUrl = `file:${dbPath}`

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  datasource: {
    url: dbUrl,
  },
  migrate: {
    adapter: () => new PrismaLibSql({ url: dbUrl }),
  },
})
