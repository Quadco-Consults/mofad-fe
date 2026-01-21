import React from 'react'
import { X, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface BulkActionBarProps {
  /** Number of selected items */
  selectedCount: number
  /** Called when selection is cleared */
  onClearSelection: () => void
  /** Called when bulk delete is requested */
  onBulkDelete: () => void
  /** Whether a delete operation is in progress */
  isDeleting?: boolean
  /** Entity name for display (e.g., "products", "customers") */
  entityName?: string
  /** Custom actions to render */
  customActions?: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Position of the bar */
  position?: 'top' | 'bottom' | 'fixed-bottom'
}

/**
 * A floating action bar that appears when items are selected.
 * Provides bulk operations like delete.
 *
 * @example
 * ```tsx
 * const selection = useSelection<Product>()
 *
 * {selection.selectedCount > 0 && (
 *   <BulkActionBar
 *     selectedCount={selection.selectedCount}
 *     onClearSelection={selection.clearSelection}
 *     onBulkDelete={() => setShowDeleteConfirm(true)}
 *     isDeleting={deleteMutation.isPending}
 *     entityName="products"
 *   />
 * )}
 * ```
 */
export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  isDeleting = false,
  entityName = 'items',
  customActions,
  className,
  position = 'fixed-bottom',
}: BulkActionBarProps) {
  if (selectedCount === 0) {
    return null
  }

  const positionClasses = {
    top: 'relative',
    bottom: 'relative',
    'fixed-bottom': 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg',
        positionClasses[position],
        className
      )}
      role="toolbar"
      aria-label="Bulk actions"
    >
      {/* Selection count */}
      <div className="flex items-center gap-2">
        <span className="bg-primary-600 text-white text-sm font-medium px-2 py-0.5 rounded">
          {selectedCount}
        </span>
        <span className="text-sm text-gray-300">
          {entityName} selected
        </span>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-700" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Delete button */}
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-1" />
          )}
          Delete
        </Button>

        {/* Custom actions */}
        {customActions}
      </div>

      {/* Clear selection button */}
      <button
        type="button"
        onClick={onClearSelection}
        className="ml-auto p-1 hover:bg-gray-800 rounded transition-colors"
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default BulkActionBar
