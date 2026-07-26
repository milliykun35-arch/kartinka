"use client"

import React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info, CheckCircle } from "lucide-react"

export interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  type?: "warning" | "info" | "success"
}

let showConfirmDialog: ((options: ConfirmOptions) => Promise<boolean>) | null = null

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)

  useEffect(() => {
    showConfirmDialog = (opts: ConfirmOptions) => {
      return new Promise<boolean>((resolve) => {
        setOptions(opts)
        setIsOpen(true)
        setResolver(() => resolve)
      })
    }
  }, [])

  const handleConfirm = () => {
    if (resolver) resolver(true)
    setIsOpen(false)
    setOptions(null)
    setResolver(null)
  }

  const handleCancel = () => {
    if (resolver) resolver(false)
    setIsOpen(false)
    setOptions(null)
    setResolver(null)
  }

  const icon = options?.type === "warning" ? AlertTriangle : options?.type === "success" ? CheckCircle : Info
  const iconColor =
    options?.type === "warning" ? "text-red-600" : options?.type === "success" ? "text-green-600" : "text-blue-600"

  return (
    <>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {icon && React.createElement(icon, { className: `h-5 w-5 ${iconColor}` })}
              {options?.title}
            </DialogTitle>
            {options?.description && <DialogDescription>{options.description}</DialogDescription>}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} className="bg-transparent">
              {options?.cancelText || "Bekor qilish"}
            </Button>
            <Button onClick={handleConfirm} className="bg-[#7C5C3E] hover:bg-[#5C3D1E] text-white">
              {options?.confirmText || "Tasdiqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { showConfirmDialog }

export function useConfirmDialog() {
  const confirm = async (options: ConfirmOptions): Promise<boolean> => {
    if (!showConfirmDialog) {
      return false
    }
    return await showConfirmDialog(options)
  }

  return { confirm }
}

export async function showAlert(title: string, description: string, type: "warning" | "info" | "success" = "info") {
  if (!showConfirmDialog) return
  await showConfirmDialog({
    title,
    description,
    confirmText: "OK",
    cancelText: "",
    type,
  })
}

export async function confirm(title: string, description: string): Promise<boolean> {
  if (!showConfirmDialog) return false
  return await showConfirmDialog({
    title,
    description,
    confirmText: "Ha",
    cancelText: "Yo'q",
    type: "warning",
  })
}
