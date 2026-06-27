import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/helpers'

export default function Modal({ open, onClose, title, children, size = 'md', className = '' }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={cn(
        'w-full rounded-xl border-none p-0 shadow-2xl',
        'animate-scale-in',
        sizeClasses[size],
        className
      )}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-brand-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-400 hover:text-brand-700 hover:bg-brand-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
