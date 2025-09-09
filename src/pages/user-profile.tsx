"use client"

import { useState, useEffect } from "react"
import { supabase } from "../client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { FaCrown, FaUsers } from "react-icons/fa6"
import { FaCheckCircle, FaSignInAlt } from "react-icons/fa"
import { adminApi } from "../../lib/admin-api"

export default function UserProfile() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    email: "",
    fullName: "",
    role: "",
  })

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const userRole = await adminApi.getUserRole()
        setProfileData({
          email: user.email || "",
          fullName: user.user_metadata?.full_name || "",
          role: userRole || "user",
        })
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profileData.fullName },
      })

      if (error) {
        alert("Error updating profile: " + error.message)
      } else {
        alert("Profile updated successfully!")
        setIsEditing(false)
        getCurrentUser()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile. Please try again.")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user) {
      setProfileData({
        email: user.email || "",
        fullName: user.user_metadata?.full_name || "",
        role: profileData.role,
      })
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">User Profile</h1>
          <p className="text-slate-600">Manage your account information</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gray-600 px-8 py-10">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaUsers className="fas fa-user-check text-gray-400 text-4xl" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-1">
                  {profileData.fullName || (profileData.role === "admin" ? "Admin User" : "User")}
                </h2>
                <p className="text-emerald-50 mb-2">{profileData.email}</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-gray-400">
                  {profileData.role === "admin" ? (
                    <FaCrown className="text-amber-400 mr-2" />
                  ) : (
                    <FaUsers className="text-blue-400 mr-2" />
                  )}
                  {profileData.role === "admin" ? "Administrator" : "User"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Profile Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all duration-200 flex items-center gap-2"
                >
                  <i className="fas fa-edit"></i>
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <i className="fas fa-save"></i>
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                  <i className="fas fa-envelope absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                </div>
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, fullName: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 ${
                      isEditing
                        ? "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        : "bg-slate-50 cursor-not-allowed"
                    }`}
                  />
                  <i className="fas fa-user absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.role === "admin" ? "Administrator" : "User"}
                    disabled
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                  <i className="fas fa-crown absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                </div>
                <p className="text-xs text-slate-500 mt-1">Role is assigned by system</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Account Created</label>
                <div className="relative">
                  <input
                    type="text"
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    disabled
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                  <i className="fas fa-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Account Statistics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                      <FaSignInAlt className=" text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Last Login</p>
                      <p className="font-semibold text-slate-800">
                        {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <FaCheckCircle className=" text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Account Status</p>
                      <p className="font-semibold text-emerald-600">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
