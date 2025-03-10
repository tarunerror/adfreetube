"use client"

import * as React from "react"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast/toast-primitive"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 100000

type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  duration?: number
}

type ActionType = (props: ToastProps) => void

let count = 0

function genId() {
  return `toast-${count++}`
}

const ToasterContext = React.createContext<{
  addToast: (toast: ToastProps) => void
  updateToast: (id: string, toast: ToastProps) => void
  dismissToast: (id: string) => void
  toasts: (ToastProps & { id: string })[]
}>({
  addToast: () => {},
  updateToast: () => {},
  dismissToast: () => {},
  toasts: [],
})

function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([])

  const addToast = React.useCallback((toast: ToastProps) => {
    setToasts((prev) => {
      if (prev.length >= TOAST_LIMIT) {
        return [...prev.slice(1), { ...toast, id: genId() }]
      }
      return [...prev, { ...toast, id: genId() }]
    })
  }, [])

  const updateToast = React.useCallback((id: string, toast: ToastProps) => {
    setToasts((prev) => {
      return prev.map((t) => (t.id === id ? { ...t, ...toast } : t))
    })
  }, [])

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = React.useMemo(
    () => ({
      addToast,
      updateToast,
      dismissToast,
      toasts,
    }),
    [addToast, updateToast, dismissToast, toasts],
  )

  return (
    <ToastProvider swipeDirection="right">
      <ToasterContext.Provider value={value}>{children}</ToasterContext.Provider>
      <ToastViewport />
    </ToastProvider>
  )
}

function useToast() {
  return React.useContext(ToasterContext)
}

const toast: ActionType = (props: ToastProps) => {
  const { addToast } = useToast()
  addToast(props)
}

export { toast, useToast, ToasterProvider, Toast, ToastTitle, ToastDescription, ToastClose }

