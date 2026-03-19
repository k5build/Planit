import type { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: Role
      tokenVersion: number
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: Role
    tokenVersion: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    tokenVersion: number
  }
}
