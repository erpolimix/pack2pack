import { useState, useCallback } from "react"

interface ToastState {
    message: string
    type: "success" | "error"
    isVisible: boolean
}

export function useToast() {
    const [toast, setToast] = useState<ToastState>({
        message: "",
        type: "success",
        isVisible: false,
    })

    const showSuccess = useCallback((message: string) => {
        setToast({
            message,
            type: "success",
            isVisible: true,
        })
    }, [])

    const showError = useCallback((message: string) => {
        setToast({
            message,
            type: "error",
            isVisible: true,
        })
    }, [])

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, isVisible: false }))
    }, [])

    return {
        toast,
        showSuccess,
        showError,
        hideToast,
    }
}
