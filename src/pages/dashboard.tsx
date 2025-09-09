"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { User } from "../../types/user"
import { adminApi } from "../../lib/admin-api"
import { FaUsers } from "react-icons/fa6"
import { BsGenderAmbiguous } from "react-icons/bs"
import { FaHeart } from "react-icons/fa"
import { supabase } from "../client"
import { toast } from "react-hot-toast"

export default function Dashboard() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    loadProfiles()
  }, [])

  const handleLogout = async () => {
    if (isLoggingOut) return

    try {
      setIsLoggingOut(true)
      const loadingToast = toast.loading("Signing out...")

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error logging out:", error)
        toast.error("Failed to sign out. Please try again.", { id: loadingToast })
        setIsLoggingOut(false)
        return
      }

      toast.success("Signed out successfully", { id: loadingToast })

      setProfiles([])
      setUsers([])
    } catch (error) {
      console.error("Error during logout:", error)
      toast.error("An error occurred while signing out. Please try again.")
      setIsLoggingOut(false)
    }
  }

  const loadProfiles = async () => {
    try {
      setLoading(true)
      console.log("Loading all profiles for dashboard...")
      const allProfiles = await adminApi.getAllProfiles()
      console.log("Loaded profiles:", allProfiles)
      setProfiles(allProfiles || [])
    } catch (error) {
      console.error("Failed to load profiles:", error)
      toast.error("Failed to load user data.")
    } finally {
      setLoading(false)
    }
  }

  const getGenderDistribution = () => {
    const genderCounts = profiles.reduce(
      (acc, profile) => {
        const gender = profile.gender?.toLowerCase() || "other"
        const normalizedGender = gender === "male" ? "Male" : gender === "female" ? "Female" : "Other"
        acc[normalizedGender] = (acc[normalizedGender] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(genderCounts).map(([gender, count]) => ({
      name: gender,
      value: count,
      percentage: profiles.length > 0 ? ((count / profiles.length) * 100).toFixed(1) : "0",
    }))
  }

  const getMaritalStatusDistribution = () => {
    const maritalCounts = profiles.reduce(
      (acc, profile) => {
        const status = profile.marital_status || "unknown"
        const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        acc[normalizedStatus] = (acc[normalizedStatus] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(maritalCounts).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: profiles.length > 0 ? ((count / profiles.length) * 100).toFixed(1) : "0",
    }))
  }

  const getRoleDistribution = () => {
    const roleCounts = profiles.reduce(
      (acc, profile) => {
        const role = profile.role || "user"
        const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
        acc[normalizedRole] = (acc[normalizedRole] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(roleCounts).map(([role, count]) => ({
      name: role,
      value: count,
      percentage: profiles.length > 0 ? ((count / profiles.length) * 100).toFixed(1) : "0",
    }))
  }

  const genderData = getGenderDistribution()
  const maritalData = getMaritalStatusDistribution()
  const roleData = getRoleDistribution()

  const COLORS = {
    Male: "#f59e0b",
    Female: "#10b981",
    Other: "#475569",
  }

  const MARITAL_COLORS = {
    Single: "#64748B",
    Married: "#3B82F6",
    Divorced: "#F59E0B",
    Widowed: "#374151",
    Unknown: "#9ca3af",
  }

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: any[]
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: {data.value} ({data.payload.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
              isLoggingOut
                ? "bg-gray-100 text-gray-400 cursor-not-allowed transform-none shadow-sm"
                : "text-slate-800 hover:bg-gray-50"
            }`}
            title={isLoggingOut ? "Signing out..." : "Sign out"}
          >
            {isLoggingOut ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            ) : (
              <i className="fas fa-sign-out-alt text-sm"></i>
            )}
            <span className="text-sm font-medium">{isLoggingOut ? "Signing out..." : "Sign out"}</span>
          </button>
        </div>
      </div>
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
            <p className="text-slate-600">Overview of your user management system</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h3 className="text-[16px] font-medium text-slate-600">Total Users</h3>
                  <p className="text-3xl font-bold text-black">{profiles.length}</p>
                </div>
                <div className="bg-amber-500 p-3 rounded-xl mb-6">
                  <FaUsers className="fas fa-user-check text-white text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h3 className="text-[16px] font-medium text-slate-600">User Roles</h3>
                  <div className="space-y-1 mt-2">
                    {roleData.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">{item.name}</span>
                        <span className="text-sm font-semibold text-black">{item.value}</span>
                      </div>
                    ))}
                    {roleData.length > 2 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Others</span>
                        <span className="text-sm font-semibold text-black">
                          {roleData.slice(2).reduce((sum, item) => sum + item.value, 0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-amber-400 p-3 rounded-xl mb-6">
                  <FaUsers className="fas fa-user-check text-white text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h3 className="text-[16px] font-medium text-slate-600">Recent Signups</h3>
                  <p className="text-3xl font-bold text-black">
                    {
                      profiles.filter((p) => {
                        const createdAt = new Date(p.created_at)
                        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        return createdAt > weekAgo
                      }).length
                    }
                  </p>
                  <p className="text-sm text-slate-500">This week</p>
                </div>
                <div className="bg-amber-500 p-3 rounded-xl mb-6">
                  <BsGenderAmbiguous className="fas fa-chart-pie text-white text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Users Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">Recent Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {profiles.slice(0, 5).map((profile) => (
                    <tr key={profile.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{profile.full_name || "Milka Keza ISINGIZWE"}</div>
                          <div className="text-sm text-slate-500">{profile.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            profile.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {profile.role || "user"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gender Distribution Chart */}
            {/* <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Gender Distribution</h3>
              {profiles.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value: string, entry: any) => (
                          <span style={{ color: entry.color }}>
                            {value} ({genderData.find((item) => item.name === value)?.percentage} %)
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-chart-pie text-slate-300 text-4xl mb-4"></i>
                    <p className="text-slate-600">No data available</p>
                    <p className="text-sm text-slate-400">Add users to see gender distribution</p>
                  </div>
                </div>
              )}
            </div> */}

            {/* Marital Status Distribution Chart */}
            {/* <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Marital Status Distribution</h3>
              {profiles.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={maritalData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {maritalData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={MARITAL_COLORS[entry.name as keyof typeof MARITAL_COLORS] || "#64748B"}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value: string, entry: any) => (
                          <span style={{ color: entry.color }}>
                            {value} ({maritalData.find((item) => item.name === value)?.percentage} %)
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <FaHeart className="text-slate-300 text-4xl mb-4" />
                    <p className="text-slate-600">No data available</p>
                    <p className="text-sm text-slate-400">Add users to see marital status distribution</p>
                  </div>
                </div>
              )}
            </div> */}

            {/* Role Distribution Chart */}
            {/* <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Role Distribution</h3>
              {profiles.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {roleData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={MARITAL_COLORS[entry.name as keyof typeof MARITAL_COLORS] || "#64748B"}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value: string, entry: any) => (
                          <span style={{ color: entry.color }}>
                            {value} ({roleData.find((item) => item.name === value)?.percentage} %)
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <FaHeart className="text-slate-300 text-4xl mb-4" />
                    <p className="text-slate-600">No data available</p>
                    <p className="text-sm text-slate-400">Add users to see role distribution</p>
                  </div>
                </div>
              )}
            </div> */}
          </div>
        </div>
      </div>
    </>
  )
}
