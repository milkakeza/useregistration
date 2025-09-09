"use client"

import { useState, useEffect } from "react"
import { adminApi } from "../lib/admin-api"
import { useToast } from "../src/hooks/use-toast"
import { ToastContainer } from "../src/components/toast"
import { StatsCard } from "../src/components/stats-card"
import { ConfirmationDialog } from "../src/components/confirmation-dialogue"
import { FaUsers } from "react-icons/fa"
import { Trash2 } from "lucide-react"

export function RoleManagement() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    userId: "",
    userEmail: "",
  })
  const { toasts, removeToast, success, error } = useToast()

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      setLoading(true)
      console.log(" Loading authenticated user profiles...")
      const profiles = await adminApi.getAllProfiles()
      console.log("Loaded profiles:", profiles)
      setProfiles(profiles || [])
    } catch (error) {
      console.error("Failed to load profiles:", error)
      error("Failed to load user profiles. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setLoading(true)
      await adminApi.updateUserRole(userId, newRole)
      await loadProfiles() // Refresh the list
      setShowRoleModal(false)
      setSelectedUser(null)
      success(`User role updated to ${newRole}!`)
    } catch (error) {
      console.error("Failed to update user role:", error)
      error("Failed to update user role. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, email: string) => {
    setDeleteConfirmation({
      isOpen: true,
      userId,
      userEmail: email,
    })
  }

  const handleConfirmDelete = async () => {
    try {
      setLoading(true)
      await adminApi.deleteUser(deleteConfirmation.userId)
      await loadProfiles() // Refresh the list
      success("User deleted successfully!")
    } catch (error) {
      console.error("Failed to delete user:", error)
      error("Failed to delete user. Please try again.")
    } finally {
      setLoading(false)
      setDeleteConfirmation({ isOpen: false, userId: "", userEmail: "" })
    }
  }

  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmation({ isOpen: false, userId: "", userEmail: "" })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openRoleModal = (user: any) => {
    setSelectedUser(user)
    setShowRoleModal(true)
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Role Management</h1>
              <p className="text-slate-600">Manage authenticated user roles and permissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <StatsCard userCount={profiles.length} title="Total Authenticated Users" Icon={FaUsers} />

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">User Profiles</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : profiles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  profiles.map((profile) => (
                    <tr key={profile.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {profile.full_name || "Milka Keza ISINGIZWE"}
                          </div>
                          <div className="text-sm text-black">{profile.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={profile.role || "user"}
                          onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          disabled={loading}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(profile.id, profile.email)}
                          className="text-red-600 hover:text-red-900 "
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 text-center" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Change User Role</h3>
            <p className="text-slate-600 mb-6">
              Change role for <strong>{selectedUser.email}</strong>
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleRoleChange(selectedUser.id, "user")}
                disabled={loading || selectedUser.role === "user"}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedUser.role === "user"
                    ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                    : "border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="font-medium">Regular User</div>
                <div className="text-sm text-slate-500">Standard user permissions</div>
              </button>

              <button
                onClick={() => handleRoleChange(selectedUser.id, "admin")}
                disabled={loading || selectedUser.role === "admin"}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedUser.role === "admin"
                    ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                    : "border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="font-medium">Administrator</div>
                <div className="text-sm text-slate-500">Full admin access</div>
              </button>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRoleModal(false)
                  setSelectedUser(null)
                }}
                disabled={loading}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Dialog for Delete Action */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={handleCloseDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete user ${deleteConfirmation.userEmail}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}
