"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { User, CreateUserData } from "../../types/user"

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userData: CreateUserData) => void
  editingUser: User | null
}

export function UserModal({ isOpen, onClose, onSubmit, editingUser }: UserModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    address: "",
    age: "",
    gender: "",
    maritalStatus: "",
  })

  useEffect(() => {
    if (editingUser) {
      setFormData({
        fullName: editingUser.name || "",
        idNumber: editingUser.nationalId || "",
        address: editingUser.address || "",
        age: editingUser.age?.toString() || "",
        gender: editingUser.gender || "",
        maritalStatus: "", // Default since API doesn't have marital status
      })
    } else {
      setFormData({
        fullName: "",
        idNumber: "",
        address: "",
        age: "",
        gender: "",
        maritalStatus: "",
      })
    }
  }, [editingUser, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const userData: CreateUserData = {
      name: formData.fullName.trim(),
      address: formData.address,
      age: formData.age ? Number.parseInt(formData.age) : null,
      nationalId: formData.idNumber,
      status: "",
      gender: formData.gender.toUpperCase(),
    }

    onSubmit(userData)
  }

  const handleReset = () => {
    setFormData({
      fullName: "",
      idNumber: "",
      address: "",
      age: "",
      gender: "",
      maritalStatus: "",
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative transform transition-all duration-300">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
        >
          &times;
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className={`fas ${editingUser ? "fa-user-edit" : "fa-user-plus"} text-white text-sm`}></i>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {editingUser ? "Edit User Information" : "Add New User"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
              <input
                type="text"
                required
                placeholder="16-digit ID number"
                pattern="^\d{16}$"
                title="ID number must be exactly 16 digits"
                value={formData.idNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, idNumber: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                rows={2}
                required
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  required
                  placeholder="Age"
                  value={formData.age}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                  required
                  value={formData.maritalStatus}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maritalStatus: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <div className="flex gap-3">
                {["Male", "Female", "Other"].map((gender) => (
                  <label key={gender} className="flex items-center cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      required
                      checked={formData.gender === gender}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          gender: e.target.value,
                        }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 border-2 rounded-full mr-2 flex items-center justify-center transition-colors ${
                        formData.gender === gender ? "border-blue-500" : "border-gray-300"
                      }`}
                    >
                      {formData.gender === gender && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                    </div>
                    <span className="text-gray-700">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-2.5 px-4 text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {editingUser ? "Update User" : "Add User"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-gray-100 text-gray-700 font-medium py-2.5 px-4 text-sm rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
