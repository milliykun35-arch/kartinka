"use client"

import React, { useEffect } from "react"
import { ShoppingCart, Check, X } from "lucide-react"

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#7C5C3E] px-4 py-3 text-white shadow-2xl shadow-[#7C5C3E]/40 animate-in fade-in slide-in-from-bottom-5 duration-300 border border-white/20">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
        <ShoppingCart className="h-5 w-5 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-amber-200">Savatga qo'shildi!</span>
        <span className="text-sm font-semibold text-white">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-2 rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
