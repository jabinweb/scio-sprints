import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      // Add user id to session
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn() {
      // Handle sign in logic here if needed
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})