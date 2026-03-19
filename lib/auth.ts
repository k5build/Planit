import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
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

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            nameEncrypted: true,
            role: true,
            tokenVersion: true,
            isActive: true,
            avatarUrl: true,
          },
        })

        if (!user || !user.isActive || !user.passwordHash) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        // Update last login (non-blocking)
        void db.user
          .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
          .catch(() => {})

        return {
          id: user.id,
          email: user.email,
          name: null,
          image: user.avatarUrl,
          role: user.role,
          tokenVersion: user.tokenVersion,
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role as unknown as string
        token.tokenVersion = user.tokenVersion
      }

      // On session update, re-fetch to detect role changes
      if (trigger === 'update' && token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, tokenVersion: true, isActive: true },
        })
        if (!dbUser || !dbUser.isActive) {
          // Invalidate session by clearing required fields
          delete token.id
          return token
        }
        token.role = dbUser.role as unknown as string
        token.tokenVersion = dbUser.tokenVersion
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
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        const existing = await db.user.findUnique({
          where: { email: user.email },
        })
        if (!existing) {
          await db.user.create({
            data: {
              email: user.email,
              role: 'GUEST',
              avatarUrl: user.image ?? undefined,
              lastLoginAt: new Date(),
            },
          })
        } else if (!existing.isActive) {
          return false
        }
      }
      return true
    },
  },
})
