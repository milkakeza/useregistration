"use client"

import { useState } from "react"
import { adminApi } from "../lib/admin-api"
import type { Profile } from "../types/user"

interface PendingApprovalsProps {
  profiles: Profile[]
  onRefresh: () => void
}

export function PendingApprovals({ profiles, onRefresh }: PendingApprovalsProps) {
  const [loading, setLoading] = useState(false)

  // Filter for users that might need approval (regular users)
  const pendingUsers = profiles.filter((profile) => profile.role === "user")

  const handleApproveUser = async (userId: string, email: string) => {
    try {
      setLoading(true)
      // For now, we'll just update their role to 'approved' or keep as 'user'
      // You can modify this based on your approval workflow
      await adminApi.updateUserRole(userId, "user")
      onRefresh()
      alert(`User ${email} has been processed.`)
    } catch (error) {
      console.error("Failed to approve user:", error)
      alert("Failed to process user approval. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRejectUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to reject user ${email}?`)) {
      return
    }

    try {
      setLoading(true)
      await adminApi.deleteUser(userId)
      onRefresh()
      alert(`User ${email} has been rejected and removed.`)
    } catch (error) {
      console.error("Failed to reject user:", error)
      alert("Failed to reject user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pending Approvals</h2>
          <p className="text-slate-600">Review and approve new user registrations</p>
        </div>
        <div className="text-sm text-slate-500">Pending: {pendingUsers.length}</div>
      </div>

      {/* Pending Users */}
      {pendingUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check-circle text-emerald-600 text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">All caught up!</h3>
          <p className="text-slate-500">No pending user approvals at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map((profile) => (
            <div key={profile.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600 font-medium text-lg">{profile.email.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">{profile.full_name || "No name provided"}</h3>
                    <p className="text-slate-500">{profile.email}</p>
                    <p className="text-sm text-slate-400">
                      Registered: {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApproveUser(profile.id, profile.email)}
                    disabled={loading}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-check"></i>
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectUser(profile.id, profile.email)}
                    disabled={loading}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-times"></i>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
