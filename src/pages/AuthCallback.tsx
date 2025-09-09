"use client"

import { useEffect } from "react"
import { supabase } from "../client"

const AuthCallback = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error during auth callback:", error)
        alert("Authentication failed. Please try again.")
        window.location.href = "/login"
        return
      }

      if (data.session) {
        alert("Email confirmed successfully! You are now logged in.")
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
