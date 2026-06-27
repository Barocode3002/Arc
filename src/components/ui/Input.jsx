import { cn } from '../../utils/helpers'

const baseInput = [
  'w-full rounded-lg border border-brand-200 bg-white px-3.5 py-2.5',
  'text-sm text-brand-900 placeholder:text-brand-400',
  'transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
  'disabled:bg-brand-50 disabled:cursor-not-allowed',
].join(' ')

export function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-brand-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
        )}
        <input
          className={cn(baseInput, Icon && 'pl-10', error && 'border-danger-500 focus:ring-danger-500/30', className)}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-brand-700">
          {label}
        </label>
      )}
      <textarea
        className={cn(baseInput, 'min-h-[80px] resize-y', error && 'border-danger-500', className)}
        {...props}
      />
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  )
}

export function Select({ label, error, options = [], placeholder, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-brand-700">
          {label}
        </label>
      )}
      <select
        className={cn(baseInput, 'appearance-none cursor-pointer', error && 'border-danger-500', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value
          const label = typeof opt === 'string' ? opt : opt.label
          return <option key={value} value={value}>{label}</option>
        })}
      </select>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  )
}
