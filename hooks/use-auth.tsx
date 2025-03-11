"use client"

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()

  const isLoading = status === "loading"

  const user = session?.user
    ? {
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
      }
    : null

  const signIn = () => {
    nextAuthSignIn("google", { callbackUrl: "localhost:3000" })
  }

  const signOut = () => {
    nextAuthSignOut({ callbackUrl: "localhost:3000" })
  }

  return {
    user,
    isLoading,
    signIn,
    signOut,
    session,
  }
}

