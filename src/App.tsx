"use client"

import { useState, useEffect } from "react"
import { supabase } from "./client"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import UserManagement from "./pages/UserManagement"
import UserProfile from "./pages/user-profile"
import { Sidebar } from "./components/layout/sidebar"
import type { Session } from "@supabase/supabase-js"

const App = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState("dashboard")

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "users":
        return <UserManagement />
      case "profile":
        return <UserProfile />
      default:
        return <Dashboard />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, show the dashboard with sidebar
  if (session) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar user={session.user} currentPage={currentPage} onPageChange={setCurrentPage} />
        <div className="flex-1">{renderCurrentPage()}</div>
      </div>
    )
  }

  // If not authenticated, show login page
  return <Login />
}

export default App
