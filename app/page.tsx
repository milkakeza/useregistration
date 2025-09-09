"use client"

import { useState, useEffect } from "react"
import { UserTable } from "../src/components/user-table"
import { UserModal } from "../src/components/user-modal"
import { StatsCard } from "../src/components/stats-card"
import type { User, CreateUserData } from "../types/user"
import { userApi } from "../lib/api"
import { isAdmin } from "../lib/supabase"

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminAndRedirect = async () => {
      try {
        const adminStatus = await isAdmin()
        if (adminStatus) {
          window.location.href = "/admin"
          return
        }
      } catch (error) {
        console.log("Not authenticated or not admin, staying on main page")
      }
      loadUsers()
    }

    checkAdminAndRedirect()
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

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">User Management</h1>
              <p className="text-slate-600">Manage and organize your registered users</p>
            </div>
            <button
              onClick={handleOpenModal}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700  transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Add New User
            </button>
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
