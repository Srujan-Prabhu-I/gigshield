import { type User } from "@supabase/supabase-js"
import { supabase as browserClient } from "./supabase"

export function getSupabaseAuthClient() {
  return browserClient
}

export async function requestOtp(input: { email?: string }) {
  const supabase = getSupabaseAuthClient()

  if (input.email) {
    // Dynamically grab the current origin so you can test on localhost
    const redirectTo = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback`
      : "https://gigshield-six.vercel.app/auth/callback"
    
    return supabase.auth.signInWithOtp({
      email: input.email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo,
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
  callback: (event: any, session: any) => void
) {
  return getSupabaseAuthClient().auth.onAuthStateChange(callback)
}

export async function upsertProfileForUser(user: User) {
  const supabase = getSupabaseAuthClient()
  const { data, error } = await (supabase as any)
    .from("profiles")
    .upsert([
      {
        id: user.id,
        email: user.email ?? null,
      }
    ])

  console.log("UPSERT PROFILE RESULT:", { data, error })

  return { data, error }
}

export async function fetchUserRole(userId: string) {
  const supabase = getSupabaseAuthClient()
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single()
  
  if (error || !data) {
    return null
  }
  return data.role
}

export async function setUserRole(userId: string, role: string) {
  const supabase = getSupabaseAuthClient()
  
  // Check if role already exists to prevent duplicates
  const { data: existing, error: checkError } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (checkError && checkError.code !== "PGRST116") {
    return { data: null, error: checkError }
  }

  // If role doesn't exist, insert it
  if (!existing) {
    const { data, error } = await supabase
      .from("user_roles")
      .insert([{ user_id: userId, role: role }])
    return { data, error }
  }

  // If role exists but different, update it
  if (existing && existing.role !== role) {
    const { data, error } = await supabase
      .from("user_roles")
      .update({ role: role })
      .eq("user_id", userId)
    return { data, error }
  }

  // Role already set correctly
  return { data: existing, error: null }
}


