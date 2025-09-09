"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "../../components/admin-guard"
import { AdminHeader } from "../../components/admin-header"
import { AdminDashboard } from "../../components/admin-dashboard"
import { RoleManagement } from "../../components/role-management"
import { PendingApprovals } from "../../components/pending-approvals"
import { adminApi } from "../../lib/admin-api"
import type { Profile } from "../../types/user"

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState<"dashboard" | "users" | "approvals">("dashboard")
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  const loadProfiles = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getAllProfiles()
      setProfiles(data)
    } catch (error) {
      console.error("Failed to load profiles:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  const renderCurrentPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      )
    }

    switch (currentPage) {
      case "dashboard":
        return <AdminDashboard profiles={profiles} onRefresh={loadProfiles} />
      case "users":
        return <RoleManagement profiles={profiles} onRefresh={loadProfiles} />
      case "approvals":
        return <PendingApprovals profiles={profiles} onRefresh={loadProfiles} />
      default:
        return <AdminDashboard profiles={profiles} onRefresh={loadProfiles} />
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50">
        <AdminHeader currentPage={currentPage} onPageChange={setCurrentPage} />
        <div className="max-w-7xl mx-auto px-6 py-8">{renderCurrentPage()}</div>
      </div>
    </AdminGuard>
  )
}
