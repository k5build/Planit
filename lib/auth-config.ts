/**
 * Minimal auth config used in Edge Middleware.
 * Does NOT import db.ts or any Node.js-only modules.
 */
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import type { Provider } from 'next-auth/providers'
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

const edgeProviders: Provider[] = [Credentials({ credentials: {} })]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  edgeProviders.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

export const { auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET ?? 'dev-secret-change-in-production',
  session: { strategy: 'jwt' },
  providers: edgeProviders,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role as unknown as string
        token.tokenVersion = user.tokenVersion
      }
      return token
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
        session.user.role = token.role as unknown as Role
        session.user.tokenVersion = token.tokenVersion as number
      }
      return session
    },
  },
})
