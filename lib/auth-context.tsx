"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import {
  onAuthStateChanged,
  requestOtp,
  signOutAuth,
  upsertProfileForUser,
  fetchUserRole
} from "@/lib/supabase-auth"

type AuthContextType = {
  user: User | null
  role: string | null
  loading: boolean
  mounted: boolean
  authModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  sendMagicLink: (input: { email?: string }) => Promise<boolean>
  signOut: () => Promise<void>
  setRole: (role: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRoleState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const hasRunRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user || hasRunRef.current) return

    hasRunRef.current = true

  const ensureProfile = async () => {
      try {
        await upsertProfileForUser(user!)
      } catch {
        // Non-critical, ignore profile upsert errors silently
      }
    }

    ensureProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])


  // Auth state listener - only set user from session
  useEffect(() => {
    let mounted = true

    const { data } = onAuthStateChanged((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  // Role fetcher - separate effect, only runs when user changes
  useEffect(() => {
    if (!user?.id) {
      setRoleState(null)
      return
    }

    let isMounted = true

    const fetchRole = async () => {
      try {
        const fetchedRole = await fetchUserRole(user.id)
        if (isMounted) {
          setRoleState(fetchedRole)
        }
      } catch (error) {
        console.error("Failed to fetch role:", error)
        if (isMounted) setRoleState(null)
      }
    }

    fetchRole()

    return () => {
      isMounted = false
    }
  }, [user?.id])

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
    setRoleState(null)
    // Hard redirect clears session cookies and prevents stale state on protected routes
    window.location.href = "/"
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      role,
      loading,
      mounted,
      authModalOpen,
      openAuthModal: () => setAuthModalOpen(true),
      closeAuthModal: () => setAuthModalOpen(false),
      sendMagicLink,
      signOut,
      setRole: (r: string) => setRoleState(r),
    }),
    [authModalOpen, loading, sendMagicLink, signOut, user, role, mounted]
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

