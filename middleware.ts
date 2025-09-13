import NextAuth from "next-auth"
import authConfig from "./authConfig"

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  // Match all routes except static files and API routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}