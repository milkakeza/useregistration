"use client"

import { useState, useEffect } from "react"
import { adminApi } from "../lib/admin-api"
import { useToast } from "../src/hooks/use-toast"
import { ToastContainer } from "../src/components/toast"
import { StatsCard } from "../src/components/stats-card"
import { ConfirmationDialog } from "../src/components/confirmation-dialogue"
import { FaUsers, FaPlus } from "react-icons/fa"
import { Trash2, Edit } from "lucide-react"
import { supabase } from "../lib/supabase" // Added import for supabase

export function RoleManagement() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [editingRole, setEditingRole] = useState({ name: "", description: "" })
  const [newUser, setNewUser] = useState({ email: "", full_name: "", role: "user" })
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

  const handleAddUser = async () => {
    try {
      setLoading(true)
      // Create user in Supabase profiles table
      const { data, error: insertError } = await supabase
        .from("profiles")
        .insert([
          {
            email: newUser.email,
            full_name: newUser.full_name,
            role: newUser.role,
          },
        ])
        .select()
        .single()

      if (insertError) throw insertError

      await loadProfiles() // Refresh the list
      setShowAddUserModal(false)
      setNewUser({ email: "", full_name: "", role: "user" })
      success("User added successfully!")
    } catch (error) {
      console.error("Failed to add user:", error)
      error("Failed to add user. Please try again.")
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

  const openEditRoleModal = (user: any) => {
    setSelectedUser(user)
    setEditingRole({
      name: user.role || "user",
      description: user.role === "admin" ? "Full admin access" : "Standard user permissions",
    })
    setShowEditRoleModal(true)
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-amber-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <FaPlus />
                Add New User
              </button>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openEditRoleModal(profile)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          disabled={loading}
                          title="Edit role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
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

      {showEditRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Edit Role Details</h3>
            <p className="text-slate-600 mb-6">
              Edit role for <strong>{selectedUser.email}</strong>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                <select
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none"
                  placeholder="Role description..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditRoleModal(false)
                  setSelectedUser(null)
                }}
                disabled={loading}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRoleChange(selectedUser.id, editingRole.name)
                  setShowEditRoleModal(false)
                }}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New User</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddUserModal(false)
                  setNewUser({ email: "", full_name: "", role: "user" })
                }}
                disabled={loading}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={loading || !newUser.email || !newUser.full_name}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
              >
                Add User
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
