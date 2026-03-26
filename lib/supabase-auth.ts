import { createClient, type User } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let browserClient: ReturnType<typeof createClient> | null = null

export function getSupabaseAuthClient() {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClient
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
  callback: Parameters<ReturnType<typeof getSupabaseAuthClient>["auth"]["onAuthStateChange"]>[0]
) {
  return getSupabaseAuthClient().auth.onAuthStateChange(callback)
}

export async function upsertProfileForUser(user: User) {
  const supabase = getSupabaseAuthClient()
  const { data, error } = await supabase.from("profiles").upsert([
    {
      id: user.id,
      email: user.email ?? null,
    }
  ])

  console.log("UPSERT PROFILE RESULT:", { data, error })

  return { data, error }
}

