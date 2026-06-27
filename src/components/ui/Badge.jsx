import { cn } from '../../utils/helpers'

const variants = {
  success: 'bg-success-50 text-success-700 border-success-500/20',
  warning: 'bg-warning-50 text-warning-700 border-warning-500/20',
  danger: 'bg-danger-50 text-danger-700 border-danger-500/20',
  info: 'bg-info-50 text-info-700 border-info-500/20',
  neutral: 'bg-brand-100 text-brand-700 border-brand-300/30',
  gold: 'bg-amber-50 text-amber-800 border-amber-400/30',
}

export default function Badge({ children, variant = 'neutral', dot = false, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full animate-pulse-dot',
          variant === 'success' && 'bg-success-500',
          variant === 'warning' && 'bg-warning-500',
          variant === 'danger' && 'bg-danger-500',
          variant === 'info' && 'bg-info-500',
          variant === 'neutral' && 'bg-brand-400',
          variant === 'gold' && 'bg-gold',
        )} />
      )}
      {children}
    </span>
  )
}
