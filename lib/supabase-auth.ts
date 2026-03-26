import { type User } from "@supabase/supabase-js"
import { supabase as browserClient } from "./supabase"

export function getSupabaseAuthClient() {
  return browserClient
}

export async function requestOtp(input: { email?: string }) {
  const supabase = getSupabaseAuthClient()

  if (input.email) {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://gigshield-six.vercel.app"
    const redirectTo = `${origin}/auth/callback`
    
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
  callback: Parameters<ReturnType<typeof getSupabaseAuthClient>["auth"]["onAuthStateChange"]>[0]
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

