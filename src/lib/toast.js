/**
 * Toast Utility Component
 */
import { useState, useEffect } from 'react'

// Simple global toast store so any component can push toasts and the Toaster renders them
const listeners = new Set()
let toastsStore = []

function notify() {
  for (const cb of listeners) cb(toastsStore)
}

function addToast(toast) {
  toastsStore = [...toastsStore, toast]
  notify()
}

function removeToast(id) {
  toastsStore = toastsStore.filter((t) => t.id !== id)
  notify()
}

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function useToast() {
  const [toasts, setToasts] = useState(() => toastsStore)

  useEffect(() => {
    const cb = (next) => setToasts(next)
    listeners.add(cb)
    // sync immediately
    cb(toastsStore)
    return () => listeners.delete(cb)
  }, [])

  function make(type) {
    return (message, opts = {}) => {
      const id = genId()
      const toast = {
        id,
        type,
        message: String(message ?? ''),
        timeout: typeof opts.timeout === 'number' ? opts.timeout : 5000,
      }
      addToast(toast)
      if (toast.timeout > 0) {
        setTimeout(() => removeToast(id), toast.timeout)
      }
      return id
    }
  }

  const toast = {
    success: make('success'),
    error: make('error'),
    info: make('info'),
    warning: make('warning'),
  }

  const dismissToast = (id) => removeToast(id)

  return { toast, toasts, dismissToast }
}

export function Toaster() {
  const [toasts, setToasts] = useState(() => toastsStore)

  useEffect(() => {
    const cb = (next) => setToasts(next)
    listeners.add(cb)
    cb(toastsStore)
    return () => listeners.delete(cb)
  }, [])

  if (!toasts || toasts.length === 0) return null

  return (
    <div aria-live="polite" className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`max-w-sm w-full rounded p-3 shadow-md text-sm flex justify-between items-start gap-4 bg-card text-foreground border ${
            t.type === 'success'
              ? 'border-emerald-500/30'
              : t.type === 'error'
              ? 'border-red-500/30'
              : t.type === 'warning'
              ? 'border-yellow-500/30'
              : 'border-border'
          }`}
        >
          <div className="flex-1">
            <div className="font-medium">
              {t.type === 'success' ? 'Success' : t.type === 'error' ? 'Error' : t.type === 'warning' ? 'Warning' : 'Info'}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{t.message}</div>
          </div>
          <div className="ml-2">
            <button
              aria-label="Close"
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}