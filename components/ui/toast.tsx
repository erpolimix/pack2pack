"use client"

import { useEffect } from "react"
import { CheckCircle2, XCircle, X } from "lucide-react"

interface ToastProps {
    readonly message: string
    readonly type: "success" | "error"
    readonly isVisible: boolean
    readonly onClose: () => void
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose()
            }, 4000)

            return () => clearTimeout(timer)
        }
    }, [isVisible, onClose])

    if (!isVisible) return null

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
            <div
                className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border-2
                    ${type === "success"
                        ? "bg-brand-light border-brand-primary text-brand-dark"
                        : "bg-red-50 border-brand-alert text-red-900"
                    }
                `}
            >
                {type === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0" />
                ) : (
                    <XCircle className="h-5 w-5 text-brand-alert flex-shrink-0" />
                )}
                <span className="font-semibold text-sm">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-2 hover:opacity-70 transition-opacity"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
