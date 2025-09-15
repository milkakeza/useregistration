"use client"

import { useState } from "react"
import { adminApi } from "../lib/admin-api"
import type { Profile } from "../types/user"
import { useToast } from "../src/hooks/use-toast"
import { ToastContainer } from "../src/components/toast"
import { ConfirmationDialog } from "../src/components/confirmation-dialogue"

interface PendingApprovalsProps {
  profiles: Profile[]
  onRefresh: () => void
}

export function PendingApprovals({ profiles, onRefresh }: PendingApprovalsProps) {
  const [loading, setLoading] = useState(false)
  const { toasts, removeToast, success, error } = useToast()
  const [approveConfirmation, setApproveConfirmation] = useState<{
    isOpen: boolean
    userId: string
    userEmail: string
  }>({ isOpen: false, userId: "", userEmail: "" })
  const [rejectConfirmation, setRejectConfirmation] = useState<{
    isOpen: boolean
    userId: string
    userEmail: string
    reason: string
  }>({ isOpen: false, userId: "", userEmail: "", reason: "" })
  const [rejectReason, setRejectReason] = useState("")

  // Filter for users that might need approval (regular users)
  const pendingUsers = profiles.filter((profile) => profile.role === "user")

  const handleApproveUser = async (userId: string, email: string) => {
    setApproveConfirmation({
      isOpen: true,
      userId,
      userEmail: email,
    })
  }

  const confirmApproveUser = async () => {
    const { userId, userEmail } = approveConfirmation
    try {
      setLoading(true)
      await adminApi.updateUserRole(userId, "user")
      onRefresh()
      success(`User ${userEmail} has been approved successfully!`)
    } catch (error) {
      console.error("Failed to approve user:", error)
      error("Failed to approve user. Please try again.")
    } finally {
      setLoading(false)
      setApproveConfirmation({ isOpen: false, userId: "", userEmail: "" })
    }
  }

  const handleRejectUser = async (userId: string, email: string) => {
    setRejectConfirmation({
      isOpen: true,
      userId,
      userEmail: email,
      reason: "",
    })
    setRejectReason("")
  }

  const confirmRejectUser = async () => {
    const { userId, userEmail } = rejectConfirmation
    if (!rejectReason.trim()) {
      error("Please provide a reason for rejection.")
      return
    }

    try {
      setLoading(true)
      await adminApi.deleteUser(userId)
      onRefresh()
      success(`User ${userEmail} has been rejected and removed.`)
    } catch (error) {
      console.error("Failed to reject user:", error)
      error("Failed to reject user. Please try again.")
    } finally {
      setLoading(false)
      setRejectConfirmation({ isOpen: false, userId: "", userEmail: "", reason: "" })
      setRejectReason("")
    }
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Approve Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={approveConfirmation.isOpen}
        onClose={() => setApproveConfirmation({ isOpen: false, userId: "", userEmail: "" })}
        onConfirm={confirmApproveUser}
        title="Approve User"
        message={`Are you sure you want to approve ${approveConfirmation.userEmail}? This will grant them access to the system.`}
        confirmText="Approve"
        cancelText="Cancel"
      />

      {/* Reject Confirmation Dialog with Reason Input */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${rejectConfirmation.isOpen ? "block" : "hidden"}`}
      >
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Reject User</h3>
          <p className="text-slate-600 mb-4">
            Are you sure you want to reject {rejectConfirmation.userEmail}? Please provide a reason for rejection.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason for rejection..."
            className="w-full p-3 border border-slate-300 rounded-lg resize-none h-24 mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setRejectConfirmation({ isOpen: false, userId: "", userEmail: "", reason: "" })
                setRejectReason("")
              }}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmRejectUser}
              disabled={!rejectReason.trim() || loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Rejecting..." : "Reject User"}
            </button>
          </div>
        </div>
      </div>

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
