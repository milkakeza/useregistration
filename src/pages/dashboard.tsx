"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { User } from "../../types/user"
import { userApi } from "../../lib/api"

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await userApi.getAllUsers()
      setUsers(response.data || [])
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate gender distribution
  const getGenderDistribution = () => {
    const genderCounts = users.reduce(
      (acc, user) => {
        const gender = user.gender?.toLowerCase() || "other"
        const normalizedGender = gender === "male" ? "Male" : gender === "female" ? "Female" : "Other"
        acc[normalizedGender] = (acc[normalizedGender] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(genderCounts).map(([gender, count]) => ({
      name: gender,
      value: count,
      percentage: users.length > 0 ? ((count / users.length) * 100).toFixed(1) : "0",
    }))
  }

  const genderData = getGenderDistribution()
  const COLORS = {
    Male: "#3B82F6",
    Female: "#EC4899",
    Other: "#8B5CF6",
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
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
    <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your user management system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                <i className="fas fa-users text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
                <i className="fas fa-user-check text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Active Users</h3>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl">
                <i className="fas fa-chart-pie text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Gender Types</h3>
                <p className="text-3xl font-bold text-gray-900">{genderData.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gender Distribution Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Gender Distribution</h3>
            {users.length > 0 ? (
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
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: string, entry: any) => (
                        <span style={{ color: entry.color }}>
                          {value} ({genderData.find((item) => item.name === value)?.percentage}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-chart-pie text-gray-300 text-4xl mb-4"></i>
                  <p className="text-gray-500">No data available</p>
                  <p className="text-sm text-gray-400">Add users to see gender distribution</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Statistics</h3>
            <div className="space-y-4">
              {genderData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] }}
                    ></div>
                    <span className="font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{item.value}</p>
                    <p className="text-sm text-gray-500">{item.percentage}%</p>
                  </div>
                </div>
              ))}

              {genderData.length === 0 && (
                <div className="text-center py-8">
                  <i className="fas fa-users text-gray-300 text-3xl mb-3"></i>
                  <p className="text-gray-500">No users registered yet</p>
                  <p className="text-sm text-gray-400">Statistics will appear here once you add users</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
