import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentials.email as string
          const password = credentials.password as string

          // Validate required env vars before any logic
          if (
            !process.env.AUTH_USER_EMAIL ||
            !process.env.AUTH_USER_PASSWORD_HASH
          ) {
            console.error(
              "Missing AUTH_USER_EMAIL or AUTH_USER_PASSWORD_HASH environment variables"
            )
            return null
          }

          // Single-user credentials from environment variables
          if (
            email === process.env.AUTH_USER_EMAIL &&
            (await bcrypt.compare(
              password,
              process.env.AUTH_USER_PASSWORD_HASH
            ))
          ) {
            return { id: "1", name: "Stitcher", email }
          }

          // Generic failure (D-02): don't reveal which field is wrong
          return null
        } catch (error) {
          console.error("authorize error:", error)
          return null
        }
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
})
