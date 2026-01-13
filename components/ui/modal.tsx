"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ModalProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly onConfirm: () => void;
    readonly title: string;
    readonly description: string;
    readonly cancelText?: string;
    readonly confirmText?: string;
}

export function Modal({ isOpen, onClose, onConfirm, title, description, cancelText = "Cancelar", confirmText = "Confirmar" }: ModalProps) {
    if (!isOpen) return null

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>{confirmText}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
