"use client"

import { useEffect } from "react"
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa"

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

const ToastComponent = ({ toast, onRemove }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration || 4000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <FaCheck className="text-green-500" />
      case "error":
        return <FaTimes className="text-red-500" />
      case "warning":
        return <FaExclamationTriangle className="text-yellow-500" />
      case "info":
        return <FaInfoCircle className="text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div
      className={`
        ${getToastStyles()}
        border rounded-lg p-4 mb-3 shadow-lg
        transform transition-all duration-300 ease-in-out
        animate-in slide-in-from-right-full
        hover:shadow-xl
        flex items-center gap-3
        min-w-80 max-w-md
      `}
    >
      {getIcon()}
      <span className="flex-1 font-medium">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
        <FaTimes size={14} />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
