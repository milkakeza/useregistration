"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import Login from "./pages/Login"
import Dashboard from "./pages/dashboard"
import UserManagement from "./pages/UserManagement"
import UserProfile from "./pages/user-profile"
import PendingApproval from "./pages/PendingApproval"
import { Sidebar } from "./components/layout/sidebar"
import type { Session } from "@supabase/supabase-js"
import LeaveSystem from "./pages/LeaveSystem"
import { toast } from "react-hot-toast"
import { adminApi } from "../lib/admin-api"
import { RoleManagement } from "../components/role-management"

const App = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [checkingRole, setCheckingRole] = useState(true)
  const [profiles, setProfiles] = useState([])
  const [isCheckingRole, setIsCheckingRole] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session) {
        checkUserRole()
      } else {
        setCheckingRole(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setLoading(false)

      if (event === "SIGNED_IN" && session?.user && !userRole) {
        toast.success("Welcome back!")
      }

      if (event === "SIGNED_OUT") {
        setCurrentPage("dashboard")
        setUserRole(null)
        setCheckingRole(false)
      }

      if (event === "SIGNED_IN" && session && !userRole) {
        checkUserRole()
      }
    })

    return () => subscription.unsubscribe()
  }, [userRole])

  const checkUserRole = async () => {
    if (isCheckingRole) return

    try {
      setIsCheckingRole(true)
      setCheckingRole(true)
      const role = await adminApi.getUserRole()

      if (role !== userRole) {
        setUserRole(role)

        if (role === "admin") {
          toast.success("Admin access granted!")
        } else if (role === "user") {
          toast.success("Welcome! You have user access.")
          setCurrentPage("Leave")
        } else {
          toast.error("No valid role found. Please contact administrator.")
        }
      } else {
        setUserRole(role)
      }
    } catch (error) {
      console.error("Error checking user role:", error)
      setUserRole(null)
      toast.error("Error checking user privileges.")
    } finally {
      setCheckingRole(false)
      setIsCheckingRole(false)
    }
  }

  const renderCurrentPage = () => {
    if (!userRole) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <div className="text-red-500 text-6xl mb-4">
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">No valid role found. Please contact administrator.</p>
            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )
    }

    const hasAccess = checkPageAccess(currentPage, userRole)
    if (!hasAccess) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <div className="text-yellow-500 text-6xl mb-4">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <button
              onClick={() => setCurrentPage(userRole === "admin" ? "dashboard" : "Leave")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      )
    }

    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "users":
        return <UserManagement />
      case "roles":
        return (
          <RoleManagement
            profiles={profiles}
            onRefresh={() => {
              /* Add refresh logic if needed */
            }}
          />
        )
      case "profile":
        return <UserProfile />
      case "Leave":
        return <LeaveSystem />
      case "Pending Approval":
        return <PendingApproval />
      default:
        return userRole === "admin" ? <Dashboard /> : <LeaveSystem />
    }
  }

  const checkPageAccess = (page: string, role: string): boolean => {
    const adminPages = ["dashboard", "users", "roles", "profile", "Pending Approval"]
    const userPages = ["Leave", "profile"]

    if (role === "admin") {
      return adminPages.includes(page)
    } else if (role === "user") {
      return userPages.includes(page)
    }

    return false
  }

  if (loading || checkingRole) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{loading ? "Loading..." : "Checking user privileges..."}</p>
        </div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar user={session.user} currentPage={currentPage} onPageChange={setCurrentPage} userRole={userRole} />
        <div className="flex-1 transition-all duration-300 overflow-hidden">{renderCurrentPage()}</div>
      </div>
    )
  }

  return <Login />
}

export default App
