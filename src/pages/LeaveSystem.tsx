"use client"

import { useState, useEffect } from "react"
import { GenericModal } from "../components/user-modal"
import { StatsCard } from "../components/stats-card"
import type { User } from "../../types/user"
import { userApi } from "../../lib/api"
import { supabase } from "../client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { FaCalendar, FaPlus } from "react-icons/fa"
import { Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { ToastContainer } from "../components/toast"
import { ConfirmationDialog } from "../components/confirmation-dialogue"

interface LeaveApplication {
  id: string
  user: User
  startDate: string
  endDate: string
  reason: string
  type: string
  submittedDate: string
  status: string
}

export default function LeaveSystem() {
  const [users, setUsers] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedUserName, setSelectedUserName] = useState<string>("")
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([])
  const [editingLeave, setEditingLeave] = useState<LeaveApplication | null>(null)
  const { toasts, removeToast, success, error } = useToast()
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    leaveId: string
    userName: string
  }>({ isOpen: false, leaveId: "", userName: "" })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const API_BASE_URL = "http://localhost:8080/leave"

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getCurrentUser()
    loadUsers()
    loadLeaves()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await userApi.getAllUsers()
      setUsers(response.data || [])
    } catch (err) {
      console.error("Failed to load users:", err)
      error("Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const loadLeaves = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_BASE_URL)
      if (!response.ok) throw new Error("Failed to fetch leave applications")
      const data = await response.json()
      setLeaveApplications(data.data || [])
    } catch (err) {
      console.error(err)
      error("Failed to load leave applications. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveSubmit = async (formData: any) => {
    try {
      if (!selectedUserId) {
        error("Please select a user")
        return
      }

      const leaveData = {
        id: editingLeave?.id || undefined,
        user: {
          id: Number.parseInt(selectedUserId),
          name: selectedUserName,
          address: users.find((u) => u.id.toString() === selectedUserId)?.address || null,
          age: users.find((u) => u.id.toString() === selectedUserId)?.age || null,
          nationalId: users.find((u) => u.id.toString() === selectedUserId)?.nationalId || null,
          status: users.find((u) => u.id.toString() === selectedUserId)?.status || null,
          gender: users.find((u) => u.id.toString() === selectedUserId)?.gender || null,
        },
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        type: formData.type,
        submittedDate: editingLeave?.submittedDate || new Date().toISOString().split("T")[0],
        status: editingLeave?.status || "PENDING",
      }

      if (editingLeave) {
        const response = await fetch(`${API_BASE_URL}/${editingLeave.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leaveData),
        })

        if (!response.ok) throw new Error("Failed to update leave")

        const result = await response.json()
        const updatedLeave: LeaveApplication = result.data || result
        setLeaveApplications((prev) => prev.map((leave) => (leave.id === editingLeave.id ? updatedLeave : leave)))
        success("Leave application updated successfully!")
      } else {
        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leaveData),
        })

        if (!response.ok) throw new Error("Failed to submit leave")

        const result = await response.json()
        console.log("API Response:", result) // Added debugging to see API response structure

        const savedLeave: LeaveApplication = result.data || result

        if (savedLeave && !savedLeave.user) {
          savedLeave.user = leaveData.user
        }

        console.log("Processed Leave:", savedLeave) // Debug processed leave data

        setLeaveApplications((prev) => [...prev, savedLeave])
        success("Leave application submitted successfully!")

        await loadLeaves()
      }

      handleCloseModal()
    } catch (err) {
      console.error(err)
      error(`Failed to ${editingLeave ? "update" : "submit"} leave. Please try again.`)
    }
  }

  const handleEditLeave = (leave: LeaveApplication) => {
    setEditingLeave(leave)
    setSelectedUserId(leave.user.id.toString())
    setSelectedUserName(leave.user.name)
    setIsModalOpen(true)
  }

  const handleDeleteLeave = async (leaveId: string) => {
    const leave = leaveApplications.find((l) => l.id === leaveId)
    if (!leave || !leave.user) return

    setDeleteConfirmation({
      isOpen: true,
      leaveId,
      userName: leave.user.name || "Unknown User",
    })
  }

  const confirmDeleteLeave = async () => {
    const { leaveId } = deleteConfirmation

    try {
      const response = await fetch(`${API_BASE_URL}/${leaveId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete leave")
      }

      const result = await response.json()
      if (result.status === "success") {
        setLeaveApplications((prev) => prev.filter((leave) => leave.id !== leaveId))
        success(result.message || "Leave application deleted successfully!")
      } else {
        throw new Error(result.message || "Failed to delete leave")
      }
    } catch (err) {
      console.error(err)
      error(`Failed to delete leave application: ${err instanceof Error ? err.message : "Please try again."}`)
    } finally {
      setDeleteConfirmation({ isOpen: false, leaveId: "", userName: "" })
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUserId("")
    setSelectedUserName("")
    setEditingLeave(null)
  }

  const handleOpenModal = () => {
    setEditingLeave(null)
    setIsModalOpen(true)
  }

  const handleUserSelection = (userId: string) => {
    const selectedUser = users.find((user) => user.id.toString() === userId)
    if (selectedUser) {
      setSelectedUserId(userId)
      setSelectedUserName(selectedUser.name)
    }
  }

  const totalPages = Math.ceil(leaveApplications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLeaves = leaveApplications.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, leaveId: "", userName: "" })}
        onConfirm={confirmDeleteLeave}
        title="Delete Leave Application"
        message={`Are you sure you want to delete ${deleteConfirmation.userName}'s leave application? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Leave System</h1>
            <p className="text-slate-600">Manage and organize applied leaves</p>
          </div>
          <button
            onClick={handleOpenModal}
            className="bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-amber-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <FaPlus />
            Apply For Leave
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <StatsCard userCount={leaveApplications.length} title="Total Leave Applications" Icon={FaCalendar} />

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Leave Applications</h3>
            {leaveApplications.length > 5 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 py-1 text-sm text-gray-700 min-w-[2rem] text-center">{currentPage}</span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-16 px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    User No
                  </th>
                  <th className="w-32 px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="w-24 px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="w-24 px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="w-20 px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="w-40 px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="w-24 px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="w-20 px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-20 px-3 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {currentLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-600">
                      No leave applications submitted yet
                    </td>
                  </tr>
                ) : (
                  currentLeaves
                    .filter((app) => app && app.user)
                    .map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50">
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-slate-800 truncate">
                          {app.user?.id || "N/A"}
                        </td>
                        <td
                          className="px-3 py-4 text-sm text-slate-800 truncate"
                          title={app.user?.name || "Unknown User"}
                        >
                          {app.user?.name || "Unknown User"}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-800">{app.startDate}</td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-800">{app.endDate}</td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              app.type === "SICK"
                                ? "bg-amber-100 text-amber-800"
                                : app.type === "ANNUAL"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {app.type}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-slate-800 truncate" title={app.reason}>
                          {app.reason}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-600">{app.submittedDate}</td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-600">{app.status}</td>
                        <td className="px-3 py-4">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => handleEditLeave(app)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center justify-center"
                              title="Edit Leave"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLeave(app.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center justify-center"
                              title="Delete Leave"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <GenericModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleLeaveSubmit}
        title={editingLeave ? "Edit Leave Request" : "Submit Leave Request"}
        fields={[
          {
            name: "userNo",
            label: "User No",
            type: "select",
            options: users.map((user) => user.id.toString()),
            required: true,
            customLabels: users.reduce(
              (acc, user) => {
                acc[user.id.toString()] = `${user.id} - ${user.name}`
                return acc
              },
              {} as Record<string, string>,
            ),
          },
          {
            name: "fullName",
            label: "Full Name",
            type: "text",
            placeholder: "Auto-filled based on User No",
            required: false,
            readonly: true,
          },
          {
            name: "startDate",
            label: "Start Date",
            type: "date",
            required: true,
            min: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          },
          {
            name: "endDate",
            label: "End Date",
            type: "date",
            required: true,
            min: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          },
          { name: "reason", label: "Reason", type: "textarea", placeholder: "Enter reason for leave", required: true },
          {
            name: "type",
            label: "Leave Type",
            type: "select",
            options: ["SICK", "ANNUAL", "MATERNITY"],
            required: true,
          },
        ]}
        onUserSelection={handleUserSelection}
        selectedUserId={selectedUserId}
        selectedUserName={selectedUserName}
        initialData={
          editingLeave
            ? {
                userNo: editingLeave.user.id.toString(),
                fullName: editingLeave.user.name,
                startDate: editingLeave.startDate,
                endDate: editingLeave.endDate,
                reason: editingLeave.reason,
                type: editingLeave.type,
              }
            : undefined
        }
      />
    </div>
  )
}
