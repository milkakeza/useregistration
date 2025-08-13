"use client"

import { useState, useEffect } from "react"
import { UserTable } from "../components/user-table"
import { UserModal } from "../components/user-modal"
import { StatsCard } from "../components/stats-card"
import type { User, CreateUserData } from "../../types/user"
import { userApi } from "../../lib/api"
import { supabase } from "../client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    // Get current user info
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getCurrentUser()
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await userApi.getAllUsers()
      setUsers(response.data || [])
    } catch (error) {
      console.error("Failed to load users:", error)
      alert("Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      const response = await userApi.createUser(userData)
      if (response.status === "success") {
        setUsers((prev) => [...prev, response.data])
        setIsModalOpen(false)
        alert("User created successfully!")
      }
    } catch (error) {
      console.error("Failed to create user:", error)
    }
  }

  const handleUpdateUser = async (userData: CreateUserData) => {
    if (!editingUser) return

    try {
      const response = await userApi.updateUser(editingUser.id, userData)
      if (response.status === "success") {
        setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? response.data : user)))
        setIsModalOpen(false)
        setEditingUser(null)
        alert("User updated successfully!")
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      const response = await userApi.deleteUser(userId)
      if (response.status === "success") {
        setUsers((prev) => prev.filter((user) => user.id !== userId))
        alert("User deleted successfully!")
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleOpenModal = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error logging out:", error)
        alert("Error logging out. Please try again.")
      } else {
        alert("Logged out successfully!")
        // The auth state change will automatically redirect to login
      }
    } catch (error) {
      console.error("Error during logout:", error)
      alert("Error logging out. Please try again.")
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">User Management</h1>
              <p className="text-gray-600">Manage and organize your registered users</p>
              {user && <p className="text-sm text-gray-500 mt-1">Welcome back, {user.email}</p>}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
              >
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
              <button
                onClick={handleOpenModal}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <i className="fas fa-plus"></i>
                Add New User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <StatsCard userCount={users.length} />
        <UserTable users={users} loading={loading} onEditUser={handleEditUser} onDeleteUser={handleDeleteUser} />
      </div>

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        editingUser={editingUser}
      />
    </div>
  )
}
