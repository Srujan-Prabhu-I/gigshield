"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import {
  getCurrentUser,
  onAuthStateChanged,
  requestOtp,
  signOutAuth,
  upsertProfileForUser,
} from "@/lib/supabase-auth"

type AuthContextType = {
  user: User | null
  loading: boolean
  authModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  sendMagicLink: (input: { email?: string }) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const ensureProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) return

    const { error } = await upsertProfileForUser(currentUser)
    if (error) {
      console.error("Failed to upsert profile:", error)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    getCurrentUser()
      .then(async ({ user: currentUser }) => {
        if (!mounted) return
        setUser(currentUser ?? null)
        await ensureProfile(currentUser ?? null)
      })
      .catch((error) => {
        console.error("Auth bootstrap error:", error)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    const { data } = onAuthStateChanged(async (_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      await ensureProfile(nextUser)
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [ensureProfile])

  const sendMagicLink = useCallback(async (input: { email?: string }) => {
    const { error } = await requestOtp(input)
    if (error) {
      console.error("Magic link request failed:", error)
      toast.error(error.message || "Failed to send magic link.")
      return false
    }
    toast.success("Magic link sent. Please check your email.")
    return true
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await signOutAuth()
    if (error) {
      console.error("Sign out failed:", error)
      toast.error("Failed to sign out.")
      return
    }
    setUser(null)
    toast.success("Signed out.")
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      authModalOpen,
      openAuthModal: () => setAuthModalOpen(true),
      closeAuthModal: () => setAuthModalOpen(false),
      sendMagicLink,
      signOut,
    }),
    [authModalOpen, loading, sendMagicLink, signOut, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

