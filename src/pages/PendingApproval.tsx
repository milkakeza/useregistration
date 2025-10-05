"use client"

import { useState, useEffect } from "react"
import { GenericModal } from "../components/user-modal"
import { StatsCard } from "../components/stats-card"
import type { User } from "../../types/user"
import { adminApi } from "../../lib/admin-api"
import { supabase } from "../client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useToast } from "../hooks/use-toast"
import { ToastContainer } from "../components/toast"
import { ConfirmationDialog } from "../components/confirmation-dialogue"
import { CiClock2 } from "react-icons/ci"
import { ChevronLeft, ChevronRight } from "lucide-react"

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

type LeaveFilter = "PENDING" | "APPROVED" | "REJECTED" | "ALL"

export default function PendingApproval() {
  const [profiles, setProfiles] = useState<any[]>([])
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

  const [approveConfirmation, setApproveConfirmation] = useState<{
    isOpen: boolean
    leaveId: string
    userName: string
  }>({ isOpen: false, leaveId: "", userName: "" })
  const [rejectConfirmation, setRejectConfirmation] = useState<{
    isOpen: boolean
    leaveId: string
    userName: string
    reason: string
  }>({ isOpen: false, leaveId: "", userName: "", reason: "" })
  const [rejectReason, setRejectReason] = useState("")

  const [currentFilter, setCurrentFilter] = useState<LeaveFilter>("PENDING")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const API_BASE_URL = "http://localhost:8080/leave"

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getCurrentUser()
    loadProfiles()
    fetchLeaveApplications()
  }, [])

  const loadProfiles = async () => {
    try {
      setLoading(true)
      console.log("Loading pending users for approval...")
      const pendingUsers = await adminApi.getPendingUsers()
      console.log("Loaded pending users:", pendingUsers)
      setProfiles(pendingUsers || [])
    } catch (error) {
      console.error("Failed to load pending users:", error)
      error("Failed to load pending users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveUser = async (userId: string) => {
    try {
      console.log("Approving user:", userId)
      await adminApi.updateUserRole(userId, "approved")
      setProfiles((prev) => prev.filter((profile) => profile.id !== userId))
      success("User approved successfully!")
    } catch (error) {
      console.error("Failed to approve user:", error)
      error("Failed to approve user. Please try again.")
    }
  }

  const handleRejectUser = async (userId: string) => {
    try {
      console.log("Rejecting user:", userId)
      await adminApi.deleteUser(userId)
      setProfiles((prev) => prev.filter((profile) => profile.id !== userId))
      success("User rejected and removed successfully!")
    } catch (error) {
      console.error("Failed to reject user:", error)
      error("Failed to reject user. Please try again.")
    }
  }

  const fetchLeaveApplications = async () => {
    try {
      setLoading(true)
      console.log("[v0] Admin loading all leave applications")
      const response = await fetch(`${API_BASE_URL}`)
      if (!response.ok) throw new Error("Failed to fetch leave applications")
      const data = await response.json()
      console.log("[v0] Admin loaded", data.data?.length || 0, "total leave applications")
      setLeaveApplications(data.data || [])
    } catch (error) {
      console.error(error)
      error("Failed to load leave applications. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (leaveId: string) => {
    const leave = leaveApplications.find((l) => l.id === leaveId)
    if (!leave) return

    setApproveConfirmation({
      isOpen: true,
      leaveId,
      userName: leave.user.name,
    })
  }

  const confirmApproveLeave = async () => {
    const { leaveId } = approveConfirmation
    try {
      const response = await fetch(`${API_BASE_URL}/${leaveId}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) throw new Error("Failed to approve leave")
      const result = await response.json()

      if (result.status === "success") {
        success(result.message || "Leave approved successfully!")
        fetchLeaveApplications()
      } else {
        throw new Error(result.message || "Failed to approve leave")
      }
    } catch (err) {
      console.error(err)
      error("Failed to approve leave. Please try again.")
    } finally {
      setApproveConfirmation({ isOpen: false, leaveId: "", userName: "" })
    }
  }

  const handleReject = async (leaveId: string) => {
    const leave = leaveApplications.find((l) => l.id === leaveId)
    if (!leave) return

    setRejectConfirmation({
      isOpen: true,
      leaveId,
      userName: leave.user.name,
      reason: "",
    })
    setRejectReason("")
  }

  const confirmRejectLeave = async () => {
    const { leaveId } = rejectConfirmation
    if (!rejectReason.trim()) {
      error("Please provide a reason for rejection.")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${leaveId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectReason }),
      })
      if (!response.ok) throw new Error("Failed to reject leave")
      const result = await response.json()

      if (result.status === "success") {
        success(result.message || "Leave rejected successfully!")
        fetchLeaveApplications()
      } else {
        throw new Error(result.message || "Failed to reject leave")
      }
    } catch (err) {
      console.error(err)
      error("Failed to reject leave. Please try again.")
    } finally {
      setRejectConfirmation({ isOpen: false, leaveId: "", userName: "", reason: "" })
      setRejectReason("")
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

        const savedLeave: LeaveApplication = await response.json()
        setLeaveApplications((prev) => [...prev, savedLeave])
        success("Leave application submitted successfully!")
      }

      handleCloseModal()
    } catch (error) {
      console.error(error)
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
    if (!leave) return

    setDeleteConfirmation({
      isOpen: true,
      leaveId,
      userName: leave.user.name,
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
    } catch (error) {
      console.error(error)
      error(`Failed to delete leave application: ${error instanceof Error ? error.message : "Please try again."}`)
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

  const getFilteredLeaves = (leaveApplications: LeaveApplication[], currentFilter: LeaveFilter) => {
    if (currentFilter === "ALL") return leaveApplications
    return leaveApplications.filter((leave) => leave.status === currentFilter)
  }

  const getPaginatedLeaves = (filteredLeaves: LeaveApplication[], currentPage: number, itemsPerPage: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredLeaves.slice(startIndex, endIndex)
  }

  const getTotalPages = (filteredLeaves: LeaveApplication[], itemsPerPage: number) => {
    return Math.ceil(filteredLeaves.length / itemsPerPage)
  }

  const handleFilterChange = (filter: LeaveFilter) => {
    setCurrentFilter(filter)
    setCurrentPage(1)
  }

  const filteredLeaves = getFilteredLeaves(leaveApplications, currentFilter)
  const paginatedLeaves = getPaginatedLeaves(filteredLeaves, currentPage, itemsPerPage)
  const totalPages = getTotalPages(filteredLeaves, itemsPerPage)

  const getFilterInfo = () => {
    const filteredLeaves = getFilteredLeaves(leaveApplications, currentFilter)
    switch (currentFilter) {
      case "PENDING":
        return { title: "Pending Leave Applications", count: filteredLeaves.length }
      case "APPROVED":
        return { title: "Approved Leave Applications", count: filteredLeaves.length }
      case "REJECTED":
        return { title: "Rejected Leave Applications", count: filteredLeaves.length }
      case "ALL":
        return { title: "All Leave Applications", count: filteredLeaves.length }
      default:
        return { title: "Leave Applications", count: filteredLeaves.length }
    }
  }

  const filterInfo = getFilterInfo()

  return (
    <div className="bg-slate-50 min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <ConfirmationDialog
        isOpen={approveConfirmation.isOpen}
        onClose={() => setApproveConfirmation({ isOpen: false, leaveId: "", userName: "" })}
        onConfirm={confirmApproveLeave}
        title="Approve Leave Application"
        message={`Are you sure you want to approve ${approveConfirmation.userName}'s leave application?`}
        confirmText="Approve"
        cancelText="Cancel"
      />

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${rejectConfirmation.isOpen ? "block" : "hidden"}`}
      >
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Reject Leave Application</h3>
          <p className="text-slate-600 mb-4">
            Are you sure you want to reject {rejectConfirmation.userName}'s leave application? Please provide a reason
            for rejection.
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
                setRejectConfirmation({ isOpen: false, leaveId: "", userName: "", reason: "" })
                setRejectReason("")
              }}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmRejectLeave}
              disabled={!rejectReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reject Leave
            </button>
          </div>
        </div>
      </div>

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
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Leave Management</h1>
            <p className="text-slate-600">Review and manage leave applications</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {(["PENDING", "APPROVED", "REJECTED", "ALL"] as LeaveFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentFilter === filter
                    ? "bg-gradient-to-r from-slate-600 to-slate-900 text-white shadow-lg"
                    : "text-black border border-slate-200 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {filter === "ALL" ? "All Leaves" : `${filter.charAt(0) + filter.slice(1).toLowerCase()} Leaves`}
                <span className="ml-2 text-xs bg-gradient-to-r from-slate-600 to-slate-700 text-white px-2 py-1 rounded-full">
                  {filter === "ALL"
                    ? leaveApplications.length
                    : leaveApplications.filter((leave) => leave.status === filter).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <StatsCard userCount={filterInfo.count} title={filterInfo.title} Icon={CiClock2} />

        {filteredLeaves.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">{filterInfo.title}</h3>
              {filteredLeaves.length > itemsPerPage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-slate-600 min-w-[2rem] text-center">{currentPage}</span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <th className="w-16 px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      User No
                    </th>
                    <th className="w-32 px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="w-24 px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="w-24 px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="w-20 px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="w-40 px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="w-24 px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="w-20 px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-24 px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {paginatedLeaves.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="w-16 px-4 py-4 text-sm font-medium text-slate-800 truncate">{app.user.id}</td>
                      <td className="w-32 px-4 py-4 text-sm text-slate-800 truncate" title={app.user.name}>
                        {app.user.name}
                      </td>
                      <td className="w-24 px-4 py-4 text-sm text-slate-800 truncate">{app.startDate}</td>
                      <td className="w-24 px-4 py-4 text-sm text-slate-800 truncate">{app.endDate}</td>
                      <td className="w-20 px-4 py-4">
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
                      <td className="w-40 px-4 py-4 text-sm text-slate-800 truncate" title={app.reason}>
                        {app.reason}
                      </td>
                      <td className="w-24 px-4 py-4 text-sm text-slate-600 truncate">{app.submittedDate}</td>
                      <td className="w-20 px-4 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            app.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : app.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : app.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="w-24 px-4 py-4">
                        <div className="flex gap-1 justify-center">
                          {app.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(app.id)}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-all duration-200"
                                title="Approve Leave"
                              >
                                ✅
                              </button>
                              <button
                                onClick={() => handleReject(app.id)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200"
                                title="Reject Leave"
                              >
                                ❌
                              </button>
                            </>
                          )}
                          {app.status !== "PENDING" && (
                            <span className="text-xs text-slate-400 px-1 py-1 truncate">
                              {app.status === "APPROVED" ? "Approved" : "Rejected"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredLeaves.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center mt-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CiClock2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No {currentFilter.toLowerCase()} leaves found</h3>
            <p className="text-slate-500">
              {currentFilter === "ALL"
                ? "No leave applications have been submitted yet."
                : `No ${currentFilter.toLowerCase()} leave applications at the moment.`}
            </p>
          </div>
        )}
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
