"use client"

import { useState } from "react"
import { signOut } from "../lib/supabase"

interface AdminHeaderProps {
  currentPage: "dashboard" | "users" | "approvals"
  onPageChange: (page: "dashboard" | "users" | "approvals") => void
}

export function AdminHeader({ currentPage, onPageChange }: AdminHeaderProps) {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut()
      window.location.reload()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: "fas fa-chart-bar" },
    { id: "users" as const, label: "Employee Management", icon: "fas fa-users" },
    { id: "approvals" as const, label: "Pending Approvals", icon: "fas fa-clock" },
  ]

  return (
    <div className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>

            <nav className="flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    currentPage === item.id
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <i className={item.icon}></i>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-sign-out-alt"></i>
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  )
}
