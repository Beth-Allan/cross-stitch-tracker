import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit"

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials.email as string
        const password = credentials.password as string

        // Rate limiting (D-05): 5 attempts, 30s cooldown
        const rateCheck = checkRateLimit(email)
        if (!rateCheck.allowed) {
          throw new Error(
            `Too many attempts. Try again in ${rateCheck.retryAfter} seconds.`
          )
        }

        // Single-user credentials from environment variables
        if (
          email === process.env.AUTH_USER_EMAIL &&
          (await bcrypt.compare(password, process.env.AUTH_USER_PASSWORD_HASH!))
        ) {
          resetRateLimit(email)
          return { id: "1", name: "Stitcher", email }
        }

        // Generic failure (D-02): don't reveal which field is wrong
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days (D-03)
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: async ({ auth: session }) => !!session,
  },
})
