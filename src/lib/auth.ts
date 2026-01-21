import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-login',
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username },
        })

        if (!admin) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, admin.passwordHash)

        if (!isValid) {
          return null
        }

        return {
          id: admin.id,
          name: admin.username,
          role: 'admin',
        }
      },
    }),
    CredentialsProvider({
      id: 'student-login',
      name: 'Student Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const student = await prisma.student.findUnique({
          where: { email: credentials.email },
        })

        if (!student) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, student.passwordHash)

        if (!isValid) {
          return null
        }

        // Update student status to online
        await prisma.student.update({
          where: { id: student.id },
          data: { 
            status: 'online',
            lastActive: new Date(),
          },
        })

        return {
          id: student.id,
          email: student.email,
          seatNumber: student.seatNumber,
          role: 'student',
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.seatNumber = user.seatNumber
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.seatNumber = token.seatNumber as number | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60, // 12 hours in seconds
  },
  jwt: {
    maxAge: 12 * 60 * 60, // 12 hours in seconds
  },
  secret: process.env.NEXTAUTH_SECRET || 'bootcamp-status-secret-key-change-in-production',
}

declare module 'next-auth' {
  interface User {
    role?: string
    seatNumber?: number
  }
  
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      seatNumber?: number
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    seatNumber?: number
  }
}
