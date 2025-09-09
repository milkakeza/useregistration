import { supabase } from "./supabase"
import type { Profile } from "../types/user"
import { toast } from "react-hot-toast"

export const adminApi = {
  async getUserRole(): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return null
      }

      const { data: profile, error } = await supabase.from("profiles").select("role").eq("email", user.email).single()

      if (error) {
        console.error("Error checking user role:", error)
        return null
      }

      return profile?.role || null
    } catch (error) {
      console.error("Error in getUserRole:", error)
      return null
    }
  },

  async checkAdminRole(): Promise<boolean> {
    const role = await this.getUserRole()
    return role === "admin"
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async updateUserRole(userId: string, role: string): Promise<void> {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)

    if (error) throw error

    if (currentUser && currentUser.id === userId && role === "user") {
      console.log("User role changed to 'user', showing toast and logging out...")

      toast.error("Your admin privileges have been revoked. You will be logged out shortly.", {
        duration: 3000,
        style: {
          background: "#ef4444",
          color: "#fff",
          fontWeight: "bold",
        },
      })

      setTimeout(async () => {
        await supabase.auth.signOut()
        window.location.reload()
      }, 2000)
    }
  },

  async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase.from("profiles").delete().eq("id", userId)

    if (error) throw error
  },

  async getPendingUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "user")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },
}
