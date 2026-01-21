import React from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean
  /** Whether the checkbox is in an indeterminate state (some selected) */
  indeterminate?: boolean
  /** Called when the checkbox is toggled */
  onChange: (checked: boolean) => void
  /** Whether the checkbox is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** ID for the checkbox */
  id?: string
  /** Label text */
  label?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

const iconSizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
}

/**
 * A styled checkbox component with support for indeterminate state.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Checkbox
 *   checked={isSelected}
 *   onChange={setIsSelected}
 * />
 *
 * // With indeterminate state (for "select all")
 * <Checkbox
 *   checked={allSelected}
 *   indeterminate={someSelected && !allSelected}
 *   onChange={toggleAll}
 * />
 * ```
 */
export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  className,
  size = 'md',
  id,
  label,
}: CheckboxProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled) {
      onChange(!checked)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (!disabled) {
        onChange(!checked)
      }
    }
  }

  const checkboxElement = (
    <div
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      id={id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex items-center justify-center rounded border-2 transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        sizeClasses[size],
        {
          // Unchecked state
          'border-gray-300 bg-white hover:border-gray-400':
            !checked && !indeterminate && !disabled,
          // Checked state
          'border-primary-600 bg-primary-600 hover:border-primary-700 hover:bg-primary-700':
            (checked || indeterminate) && !disabled,
          // Disabled unchecked
          'border-gray-200 bg-gray-50 cursor-not-allowed':
            !checked && !indeterminate && disabled,
          // Disabled checked
          'border-gray-300 bg-gray-300 cursor-not-allowed':
            (checked || indeterminate) && disabled,
        },
        className
      )}
    >
      {indeterminate ? (
        <Minus className={cn('text-white', iconSizeClasses[size])} strokeWidth={3} />
      ) : checked ? (
        <Check className={cn('text-white', iconSizeClasses[size])} strokeWidth={3} />
      ) : null}
    </div>
  )

  if (label) {
    return (
      <label
        className={cn(
          'inline-flex items-center gap-2 cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {checkboxElement}
        <span className="text-sm text-gray-700">{label}</span>
      </label>
    )
  }

  return checkboxElement
}

export default Checkbox
