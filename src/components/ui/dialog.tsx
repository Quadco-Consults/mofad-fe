import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  className?: string
}

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  className?: string
}

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
} | null>(null)

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogContent({ children, className, ...props }: DialogContentProps) {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error('DialogContent must be used within a Dialog')
  }

  const { open, onOpenChange } = context
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onOpenChange])

  // Focus management
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement
      dialogRef.current?.focus()
    } else {
      previousActiveElement.current?.focus()
    }
  }, [open])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  if (!open) {
    return null
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          'relative bg-white rounded-lg shadow-xl w-full my-8',
          'transform transition-all',
          'focus:outline-none',
          'max-h-[calc(100vh-4rem)] overflow-y-auto',
          className
        )}
        {...props}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors z-10"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ children, className, ...props }: DialogHeaderProps) {
  return (
    <div className={cn('px-6 pt-6 pb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function DialogFooter({ children, className, ...props }: DialogFooterProps) {
  return (
    <div className={cn('px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3', className)} {...props}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className, ...props }: DialogTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
      {children}
    </h2>
  )
}

export function DialogDescription({ children, className, ...props }: DialogDescriptionProps) {
  return (
    <p className={cn('mt-2 text-sm text-gray-600', className)} {...props}>
      {children}
    </p>
  )
}
