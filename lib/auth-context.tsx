"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import {
  onAuthStateChanged,
  requestOtp,
  verifyOtp,
  signOutAuth,
  fetchUserRole,
  getCurrentUser
} from "@/lib/supabase-auth"
import type { Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  role: string | null
  loading: boolean
  mounted: boolean
  authModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  sendOtpCode: (input: { email?: string }) => Promise<boolean>
  verifyOtpCode: (input: { email?: string; token: string }) => Promise<boolean>
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
  const router = useRouter()
  const hasRunRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Ensure user exists in metadata
  useEffect(() => {
    if (!user) return
    // No-op for now as we use user_roles
  }, [user?.id])

  // Auth state listener - REAL SUPABASE AUTH
  useEffect(() => {
    let mounted = true
    
    // Initial fetch
    const getInitialAuth = async () => {
      try {
        const { user } = await getCurrentUser()
        if (!mounted) return
        
        if (user) {
          setUser(user)
          const fetchedRole = await fetchUserRole(user.id)
          if (mounted) setRoleState(fetchedRole)
        } else {
          setUser(null)
          setRoleState(null)
        }
      } catch (err) {
        console.error("Auth init error:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    
    getInitialAuth()

    // Subscription
    const { data: { subscription } } = onAuthStateChanged(async (event, session) => {
      if (!mounted) return
      
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        const fetchedRole = await fetchUserRole(currentUser.id)
        if (mounted) setRoleState(fetchedRole)
      } else {
        setRoleState(null)
      }
      
      setLoading(false)
    })

    return () => { 
      mounted = false
      subscription.unsubscribe() 
    }
  }, [])

  const sendOtpCode = useCallback(async (input: { email?: string }) => {
    const { error } = await requestOtp(input)
    if (error) {
      toast.error(error.message)
      return false
    }
    return true
  }, [])

  const verifyOtpCode = useCallback(async (input: { email?: string; token: string }) => {
    const { error } = await verifyOtp(input)
    if (error) {
      toast.error(error.message)
      return false
    }
    return true
  }, [])

  const signOut = useCallback(async () => {
    await signOutAuth()
    // Hard clear of mock cookie just in case it's lingering from a previous session
    document.cookie = `gigshield_demo=; path=/; max-age=0`
    setUser(null)
    setRoleState(null)
    router.push("/")
  }, [router])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      role,
      loading,
      mounted,
      authModalOpen,
      openAuthModal: () => setAuthModalOpen(true),
      closeAuthModal: () => setAuthModalOpen(false),
      sendOtpCode,
      verifyOtpCode,
      signOut,
      setRole: (r: string) => setRoleState(r),
    }),
    [authModalOpen, loading, sendOtpCode, verifyOtpCode, signOut, user, role, mounted]
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

