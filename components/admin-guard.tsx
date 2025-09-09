"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { isAdmin, getCurrentUser } from "../lib/supabase"
import { AdminLogin } from "./admin-login"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        setIsAuthenticated(false)
        setIsAuthorized(false)
        return
      }

      setIsAuthenticated(true)
      const adminStatus = await isAdmin()
      setIsAuthorized(adminStatus)
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
      setIsAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const handleLoginSuccess = () => {
    checkAuth()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isAuthorized) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />
  }

  return <>{children}</>
}
