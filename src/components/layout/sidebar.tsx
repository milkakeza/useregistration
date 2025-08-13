"use client"

import { useState } from "react"
import { supabase } from "../../client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface SidebarProps {
  user: SupabaseUser | null
  currentPage: string
  onPageChange: (page: string) => void
}

export function Sidebar({ user, currentPage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error logging out:", error)
        alert("Error logging out. Please try again.")
      } else {
        alert("Logged out successfully!")
      }
    } catch (error) {
      console.error("Error during logout:", error)
      alert("Error logging out. Please try again.")
    }
  }

  const handleProfileUpdate = () => {
    setShowNotifications(false)
    onPageChange("profile")
  }

  const menuItems = [
    {
      icon: "fas fa-chart-line",
      label: "Dashboard",
      key: "dashboard",
    },
    {
      icon: "fas fa-users",
      label: "User Management",
      key: "users",
    },
    {
      icon: "fas fa-user-circle",
      label: "User Profile",
      key: "profile",
    },
  ]

  return (
    <div
      className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } min-h-screen flex flex-col relative`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
              <p className="text-sm text-gray-500">Management System</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            {/* Bell Notification Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative"
                title="Notifications"
              >
                <i className="fas fa-bell text-gray-600 text-lg"></i>
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="p-2">
                    <div
                      onClick={handleProfileUpdate}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-user-edit text-blue-600"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">Update Your Profile</p>
                        <p className="text-xs text-gray-500">Complete your profile information</p>
                      </div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      Close notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <i className={`fas ${isCollapsed ? "fa-chevron-right" : "fa-chevron-left"} text-gray-600`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => onPageChange(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  currentPage === item.key
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={isCollapsed ? item.label : ""}
              >
                <i className={`${item.icon} text-lg`}></i>
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && user && (
          <div className="mb-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-white"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Logout" : ""}
        >
          <i className="fas fa-sign-out-alt text-lg"></i>
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>}
    </div>
  )
}
