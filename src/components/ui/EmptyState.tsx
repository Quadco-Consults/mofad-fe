/**
 * Empty State Component
 *
 * Displays helpful messages and actions when no content is available.
 * Improves UX by guiding users on what to do next instead of showing blank screens.
 */

import React from 'react'
import { Button } from './Button'
import { LucideIcon } from 'lucide-react'

export interface EmptyStateProps {
  /** Icon to display (Lucide icon component) */
  icon?: LucideIcon
  /** Title/heading text */
  title: string
  /** Description/helper text */
  description?: string
  /** Primary action button */
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  /** Secondary action button */
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  /** Custom content to render instead of default layout */
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  children,
}: EmptyStateProps) {
  if (children) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        {children}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon */}
      {Icon && (
        <div className="mb-4 p-3 bg-gray-100 rounded-full">
          <Icon className="h-8 w-8 text-gray-400" aria-hidden="true" />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 max-w-md mb-6">{description}</p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex gap-3 flex-wrap justify-center">
          {action && (
            <Button
              onClick={action.onClick}
              className="bg-mofad-green hover:bg-mofad-green/90 text-white"
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" aria-hidden="true" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
