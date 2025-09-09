"use client"

import { useState, useEffect } from "react"
import { GenericModal } from "../components/user-modal"
import { StatsCard } from "../components/stats-card"
import { ToastContainer } from "../components/toast"
import { ConfirmationDialog } from "../components/confirmation-dialogue"
import { useToast } from "../hooks/use-toast"
import type { CreateUserData } from "../../types/user"
import { userApi } from "../../lib/api"
import { supabase } from "../client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { FaPlus, FaUsers } from "react-icons/fa"

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(5)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    userId: string | null
    userName: string
  }>({
    isOpen: false,
    userId: null,
    userName: "",
  })
  const { toasts, removeToast, success, error } = useToast()

  useEffect(() => {
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
      console.log("[v0] Loading employee users via user API...")
      const response = await userApi.getAllUsers()
      console.log("[v0] API response:", response)
      const employees = response.data || []
      console.log("[v0] Loaded employees:", employees)
      setUsers(employees)
    } catch (error) {
      console.error("[v0] Failed to load users:", error)
      error("Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId)
    setDeleteConfirmation({
      isOpen: true,
      userId,
      userName: userToDelete?.name || "Unknown User",
    })
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.userId) return

    try {
      await userApi.deleteUser(deleteConfirmation.userId)
      setUsers((prev) => prev.filter((user) => user.id !== deleteConfirmation.userId))
      success("User deleted successfully!")
    } catch (error) {
      console.error("Failed to delete user:", error)
      error("Failed to delete user. Please try again.")
    } finally {
      handleCloseDeleteConfirmation()
    }
  }

  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      userId: null,
      userName: "",
    })
  }

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      const mappedUserData: CreateUserData = {
        name: userData.fullName,
        nationalId: userData.idNumber,
        address: userData.address,
        age: userData.age,
        gender: userData.gender,
        status: userData.maritalStatus,
      }
      console.log("the mappped data is :", mappedUserData)
      const response = await userApi.createUser(mappedUserData)
      if (response.status === "success") {
        setUsers((prev) => [...prev, response.data])
        setIsModalOpen(false)
        success("User created successfully!")
      }
    } catch (error) {
      console.error("Failed to create user:", error)
      error("Failed to create user. Please try again.")
    }
  }

  const handleUpdateUser = async (userData: CreateUserData) => {
    if (!editingUser) return
    console.log("the data is :", userData)
    try {
      const mappedUserData: CreateUserData = {
        name: userData.fullName,
        nationalId: userData.idNumber,
        address: userData.address,
        age: userData.age,
        gender: userData.gender,
        status: userData.maritalStatus,
      }
      console.log("the mappped data is :", mappedUserData)
      const response = await userApi.updateUser(editingUser.id, mappedUserData)
      if (response.status === "success") {
        setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? response.data : user)))
        setIsModalOpen(false)
        setEditingUser(null)
        success("User updated successfully!")
      }
    } catch (error) {
      console.error("Failed to update user:", error)
      error("Failed to update user. Please try again.")
    }
  }

  const handleEditUser = (user: any) => {
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
        error("Error logging out. Please try again.")
      } else {
        success("Logged out successfully!")
      }
    } catch (error) {
      console.error("Error during logout:", error)
      error("Error logging out. Please try again.")
    }
  }

  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(users.length / usersPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">User Management</h1>
              <p className="text-slate-600">Manage employee users and their information</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleOpenModal}
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
        <StatsCard userCount={users.length} title="Total Employee Users" Icon={FaUsers} />

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Employee Profiles</h3>
              {/* <p className="text-sm text-gray-500 mt-1">
                Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, users.length)} of {users.length} users
              </p> */}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt;
                </button>
                <span className="px-2 py-1 text-sm text-gray-700 min-w-[2rem] text-center">{currentPage}</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marital Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((employee, index) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {indexOfFirstUser + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.name?.split(" ")[0] || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.name?.split(" ").slice(1).join(" ") || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.nationalId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm ${employee.gender === "Male" ? "text-blue-600" : employee.gender === "Female" ? "text-pink-600" : "text-gray-500"}`}
                        >
                          {employee.gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {employee.status || "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditUser(employee)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit user"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(employee.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete user"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
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

      {/* Modal */}
      <GenericModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        title={editingUser ? "Edit User Information" : "Add New User"}
        fields={[
          {
            name: "fullName",
            label: "Full Name",
            type: "text",
            required: true,
            placeholder: "Enter full name",
            pattern: "^[A-Za-z ]$",
            title: "Full name should only contain letters and spaces",
            minLength: 3,
            maxLength: 100,
            onInput: (e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/[^A-Za-z ]/g, "")
            },
          },
          {
            name: "idNumber",
            label: "ID Number",
            type: "text",
            required: true,
            placeholder: "16-digit ID number",
            pattern: "^[0-9]{16}$",
            title: "ID number must be exactly 16 digits",
            minLength: 16,
            maxLength: 16,
            onInput: (e) => {
              let value = e.currentTarget.value.replace(/\D/g, "")
              if (value.length > 16) {
                value = value.slice(0, 16)
              }
              e.currentTarget.value = value

              if (value.length > 0 && value.length !== 16) {
                e.currentTarget.setCustomValidity("ID number must be exactly 16 digits")
              } else {
                e.currentTarget.setCustomValidity("")
              }
            },
            onInvalid: (e) => {
              const value = e.currentTarget.value
              if (value.length === 0) {
                e.currentTarget.setCustomValidity("ID number is required")
              } else if (value.length !== 16) {
                e.currentTarget.setCustomValidity("ID number must be exactly 16 digits")
              } else if (!/^[0-9]{16}$/.test(value)) {
                e.currentTarget.setCustomValidity("ID number must contain only digits")
              }
            },
          },
          {
            name: "address",
            label: "Address",
            type: "textarea",
            required: true,
            placeholder: "Enter address",
            minLength: 5,
            maxLength: 200,
            onInvalid: (e) => {
              e.currentTarget.setCustomValidity("Address must be between 5 and 200 characters")
            },
            onInput: (e: {
              currentTarget: { setCustomValidity: (arg0: string) => void }
            }) => {
              e.currentTarget.setCustomValidity("")
            },
          },
          {
            name: "age",
            label: "Age",
            type: "number",
            required: true,
            min: 0,
            max: 120,
          },
          {
            name: "maritalStatus",
            label: "Marital Status",
            type: "select",
            required: true,
            options: ["Single", "Married", "Divorced", "Widowed"],
          },
          {
            name: "gender",
            label: "Gender",
            type: "radio",
            required: true,
            options: ["Male", "Female", "Other"],
          },
        ]}
        initialData={
          editingUser
            ? {
                fullName: editingUser.name,
                idNumber: editingUser.nationalId,
                address: editingUser.address,
                age: editingUser.age,
                gender: editingUser.gender,
                maritalStatus: editingUser.status,
              }
            : undefined
        }
      />

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={handleCloseDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteConfirmation.userName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}
