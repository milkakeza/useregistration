"use client"

import { useState, useEffect } from "react"
import type { Profile } from "../types/user"

interface AdminDashboardProps {
  profiles: Profile[]
  onRefresh: () => void
}

export function AdminDashboard({ profiles, onRefresh }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    recentSignups: 0,
  })

  useEffect(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentSignups = profiles.filter((profile) => new Date(profile.created_at) > sevenDaysAgo).length

    setStats({
      totalUsers: profiles.length,
      adminUsers: profiles.filter((p) => p.role === "admin").length,
      regularUsers: profiles.filter((p) => p.role === "user").length,
      recentSignups,
    })
  }, [profiles])

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <i className={`${icon} text-white text-xl`}></i>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon="fas fa-users" color="bg-blue-500" />
        <StatCard title="Admin Users" value={stats.adminUsers} icon="fas fa-user-shield" color="bg-emerald-500" />
        <StatCard title="Regular Users" value={stats.regularUsers} icon="fas fa-user" color="bg-amber-500" />
        <StatCard title="Recent Signups" value={stats.recentSignups} icon="fas fa-user-plus" color="bg-purple-500" />
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Recent Users</h3>
            <button
              onClick={onRefresh}
              className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2"
            >
              <i className="fas fa-refresh"></i>
              Refresh
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {profiles.slice(0, 10).map((profile) => (
                <tr key={profile.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 font-medium">{profile.email.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="ml-4">
                        {/* <div className="text-sm font-medium text-slate-900">{profile.full_name || "No name"}</div> */}
                        <div className="text-sm text-slate-500">{profile.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        profile.role === "admin" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {profile.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
