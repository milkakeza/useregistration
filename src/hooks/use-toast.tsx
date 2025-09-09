"use client"

import { useState, useCallback } from "react"
import type { Toast, ToastType } from "../components/toast"

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = "info", duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      message,
      type,
      duration,
    }

    setToasts((prev) => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback(
    (message: string, duration?: number) => {
      return addToast(message, "success", duration)
    },
    [addToast],
  )

  const error = useCallback(
    (message: string, duration?: number) => {
      return addToast(message, "error", duration)
    },
    [addToast],
  )

  const warning = useCallback(
    (message: string, duration?: number) => {
      return addToast(message, "warning", duration)
    },
    [addToast],
  )

  const info = useCallback(
    (message: string, duration?: number) => {
      return addToast(message, "info", duration)
    },
    [addToast],
  )

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
