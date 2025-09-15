"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createUserWithAuth(userData: {
  email: string
  full_name: string
  role: string
}) {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // This requires service role key
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  try {
    // Create auth user first
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: "temp-password-123", // You might want to generate a random password
      email_confirm: true,
    })

    if (authError) {
      console.error("Auth user creation failed:", authError)
      throw authError
    }

    // Create profile with the auth user's ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authUser.user.id,
        id_number: userData.id_number
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
      })
      .select()
      .single()

    if (profileError) {
      console.error("Profile creation failed:", profileError)
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id)
      throw profileError
    }

    return { success: true, data: profile }
  } catch (error) {
    console.error("User creation failed:", error)
    return { success: false, error: error.message }
  }
}
