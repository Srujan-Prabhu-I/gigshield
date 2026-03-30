import { type User } from "@supabase/supabase-js"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import { supabase as browserClient } from "./supabase"

export function getSupabaseAuthClient() {
  return browserClient
}

export async function signUpWithPassword(email: string, password: string, options?: any) {
  const supabase = getSupabaseAuthClient()
  return supabase.auth.signUp({
    email,
    password,
    options
  })
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabaseAuthClient()
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function requestOtp(input: { email?: string }) {
  const supabase = getSupabaseAuthClient()

  if (input.email) {
    return supabase.auth.signInWithOtp({
      email: input.email,
      options: {
        shouldCreateUser: true,
      },
    })
  }

  return {
    data: { user: null, session: null },
    error: new Error("Email is required."),
  }
}

export async function verifyOtp(input: { email?: string; token: string }) {
  const supabase = getSupabaseAuthClient()

  if (input.email) {
    return supabase.auth.verifyOtp({
      email: input.email,
      token: input.token,
      type: "email",
    })
  }

  return {
    data: { user: null, session: null },
    error: new Error("Email is required."),
  }
}

export async function signOutAuth() {
  return getSupabaseAuthClient().auth.signOut()
}

export async function getCurrentUser() {
  const { data, error } = await getSupabaseAuthClient().auth.getUser()
  return { user: data.user, error }
}

export function onAuthStateChanged(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  return getSupabaseAuthClient().auth.onAuthStateChange(callback)
}

/**
 * Optimized role fetching.
 * We only use the user_roles table as the source of truth.
 */
export async function fetchUserRole(userId: string) {
  const supabase = getSupabaseAuthClient()

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !data) {
    console.warn("No role found for user:", userId)
    return null
  }
  return data.role
}

/**
 * Simplified role assignment using upsert.
 * Removes dependency on a separate 'profiles' table.
 */
export async function setUserRole(userId: string, role: string, platformName?: string) {
  const supabase = getSupabaseAuthClient()
  
  const { data, error } = await supabase
    .from("user_roles")
    .upsert({ 
      user_id: userId, 
      role: role, 
      platform_name: platformName 
    }, { 
      onConflict: 'user_id' 
    })

  return { data, error }
}
