"use client"

import { useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { FaUsers } from "react-icons/fa6"
import { MdDashboard } from "react-icons/md"
import { CgProfile } from "react-icons/cg"
import { TfiNotepad } from "react-icons/tfi"
import { CiClock2 } from "react-icons/ci"
import { MdAdminPanelSettings } from "react-icons/md"
import { MdLogout } from "react-icons/md"
import { supabase } from "../../../lib/supabase"

interface SidebarProps {
  user: SupabaseUser | null
  currentPage: string
  onPageChange: (page: string) => void
  userRole: string | null // Added userRole prop
}

export function Sidebar({ user, currentPage, onPageChange, userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleProfileUpdate = () => {
    setShowNotifications(false)
    onPageChange("profile")
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.reload()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getMenuItems = () => {
    const adminItems = [
      {
        icon: <MdDashboard />,
        label: "Dashboard",
        key: "dashboard",
      },
      {
        icon: <FaUsers />,
        label: "User Management",
        key: "users",
      },
      {
        icon: <MdAdminPanelSettings />,
        label: "Role Management",
        key: "roles",
      },
      {
        icon: <CgProfile />,
        label: "User Profile",
        key: "profile",
      },
      {
        icon: <CiClock2 />,
        label: "Pending Approvals",
        key: "Pending Approval",
      },
    ]

    const userItems = [
      {
        icon: <TfiNotepad />,
        label: "Leave Application",
        key: "Leave",
      },
      {
        icon: <CgProfile />,
        label: "User Profile",
        key: "profile",
      },
    ]

    return userRole === "admin" ? adminItems : userItems
  }

  const menuItems = getMenuItems()

  return (
    <div
      className={`bg-[#1e293b] shadow-lg border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } h-screen flex flex-col relative fixed left-0 top-0 z-30`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-white truncate">
                {userRole === "admin" ? "Admin Panel" : "User Portal"}
              </h2>
              <p className="text-sm text-white truncate">
                {userRole === "admin" ? "Management System" : "Leave Management"}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 flex-shrink-0">
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
                <div className="absolute right-0 top-12 w-80 max-w-xs sm:max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="p-2">
                    <div
                      onClick={handleProfileUpdate}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-user-edit text-blue-600"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">Update Your Profile</p>
                        <p className="text-xs text-gray-500 truncate">Complete your profile information</p>
                      </div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
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
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <i className={`fas ${isCollapsed ? "fa-chevron-right" : "fa-chevron-left"} text-gray-600`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => onPageChange(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  currentPage === item.key
                    ? "bg-gradient-to-r from-slate-600 to-slate-900 text-white shadow-lg"
                    : "text-white hover:bg-gray-700"
                }`}
                title={isCollapsed ? item.label : ""}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-gray-600 bg-[#1e293b] sticky bottom-0">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200"
          title={isCollapsed ? "Sign Out" : ""}
        >
          <span className="text-lg">
            <MdLogout />
          </span>
          {!isCollapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>}
    </div>
  )
}
