"use client"

import { Edit, Trash2 } from "lucide-react"
import type { User } from "../../types/user"

interface UserTableProps {
  users: User[]
  loading: boolean
  onEditUser: (user: User) => void
  onDeleteUser: (userId: number) => void
}

export function UserTable({ users, loading, onEditUser, onDeleteUser }: UserTableProps) {
  const splitFullName = (fullName: string) => {
    const parts = fullName.trim().split(" ")
    const firstName = parts[0] || ""
    const lastName = parts.slice(1).join(" ") || ""
    return [firstName, lastName]
  }

  const formatGender = (gender: string) => {
    return gender ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase() : ""
  }

  const getGenderBadgeClass = (gender: string) => {
    const formattedGender = formatGender(gender)
    if (formattedGender === "Male") {
      return "bg-blue-100 text-blue-800"
    } else if (formattedGender === "Female") {
      return "bg-pink-100 text-pink-800"
    }
    return "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                User No.
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                First Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Last Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                ID Number
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Address
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Age
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Gender
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Marital Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr className="bg-gray-50">
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <span className="text-gray-400 text-2xl">👥</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-500 mb-2">No users registered yet</h3>
                    <p className="text-gray-400">Click "Add New User" to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, index) => {
                const [firstName, lastName] = splitFullName(user.name || "")
                const formattedGender = formatGender(user.gender)
                const displayAge = user.age !== null && user.age !== undefined ? user.age : ""

                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{firstName}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{lastName}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{user.nationalId}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={user.address}>
                      {user.address}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{displayAge}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGenderBadgeClass(
                          user.gender,
                        )}`}
                      >
                        {formattedGender}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onEditUser(user)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center justify-center"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center justify-center"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
