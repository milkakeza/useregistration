"use client"

import { useEffect } from "react"
import { supabase } from "../client"
import { toast } from "react-toastify" // Added import for toast notification

const AuthCallback = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error during auth callback:", error)
        toast.error("Authentication failed. Please try again.") // Replaced alert with toast notification
        window.location.href = "/login"
        return
      }

      if (data.session) {
        toast.success("Email confirmed successfully! You are now logged in.") // Replaced alert with toast notification
        // Redirect to main app (App.tsx will handle showing the dashboard)
        window.location.href = "/"
      } else {
        window.location.href = "/"
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4 text-slate-800">Confirming your email...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
      </div>
    </div>
  )
}

export default AuthCallback
