import { cn } from '../../utils/helpers'

export default function Card({ children, title, subtitle, className = '', padding = true, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-brand-200/60 shadow-sm',
        'transition-shadow duration-200',
        padding && 'p-5',
        className
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className={cn('mb-4', !padding && 'px-5 pt-5')}>
          {title && <h3 className="text-lg font-semibold text-brand-900">{title}</h3>}
          {subtitle && <p className="text-sm text-brand-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
