import { useState, useCallback, useMemo } from 'react'

type IdType = number | string

interface UseSelectionOptions {
  /** Initial selected IDs */
  initialSelected?: IdType[]
}

interface UseSelectionReturn<T extends { id: IdType }> {
  /** Array of selected IDs */
  selectedIds: IdType[]
  /** Set of selected IDs for O(1) lookup */
  selectedSet: Set<IdType>
  /** Number of selected items */
  selectedCount: number
  /** Check if a specific ID is selected */
  isSelected: (id: IdType) => boolean
  /** Toggle selection of a single item */
  toggle: (id: IdType) => void
  /** Select a single item */
  select: (id: IdType) => void
  /** Deselect a single item */
  deselect: (id: IdType) => void
  /** Toggle all items on the current page */
  toggleAll: (items: T[]) => void
  /** Select all items */
  selectAll: (items: T[]) => void
  /** Clear all selections */
  clearSelection: () => void
  /** Select multiple items at once */
  selectMultiple: (ids: IdType[]) => void
  /** Check if all items are selected */
  isAllSelected: (items: T[]) => boolean
  /** Check if some but not all items are selected */
  isPartiallySelected: (items: T[]) => boolean
  /** Get selected items from a list */
  getSelectedItems: (items: T[]) => T[]
}

/**
 * A hook for managing selection state in lists/tables.
 * Provides a clean API for single and bulk selection operations.
 *
 * @example
 * ```tsx
 * const selection = useSelection<Product>()
 *
 * // In your table row
 * <Checkbox
 *   checked={selection.isSelected(product.id)}
 *   onChange={() => selection.toggle(product.id)}
 * />
 *
 * // Select all checkbox
 * <Checkbox
 *   checked={selection.isAllSelected(products)}
 *   indeterminate={selection.isPartiallySelected(products)}
 *   onChange={() => selection.toggleAll(products)}
 * />
 *
 * // Bulk delete
 * <button onClick={() => bulkDelete(selection.selectedIds)}>
 *   Delete {selection.selectedCount} items
 * </button>
 * ```
 */
export function useSelection<T extends { id: IdType }>(
  options: UseSelectionOptions = {}
): UseSelectionReturn<T> {
  const { initialSelected = [] } = options

  const [selectedSet, setSelectedSet] = useState<Set<IdType>>(
    () => new Set(initialSelected)
  )

  const selectedIds = useMemo(() => Array.from(selectedSet), [selectedSet])
  const selectedCount = selectedSet.size

  const isSelected = useCallback(
    (id: IdType) => selectedSet.has(id),
    [selectedSet]
  )

  const toggle = useCallback((id: IdType) => {
    setSelectedSet(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const select = useCallback((id: IdType) => {
    setSelectedSet(prev => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const deselect = useCallback((id: IdType) => {
    setSelectedSet(prev => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const selectMultiple = useCallback((ids: IdType[]) => {
    setSelectedSet(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.add(id))
      return next
    })
  }, [])

  const selectAll = useCallback((items: T[]) => {
    setSelectedSet(new Set(items.map(item => item.id)))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedSet(new Set())
  }, [])

  const toggleAll = useCallback((items: T[]) => {
    setSelectedSet(prev => {
      const itemIds = items.map(item => item.id)
      const allSelected = itemIds.every(id => prev.has(id))

      if (allSelected) {
        // Deselect all items on current page
        const next = new Set(prev)
        itemIds.forEach(id => next.delete(id))
        return next
      } else {
        // Select all items on current page
        const next = new Set(prev)
        itemIds.forEach(id => next.add(id))
        return next
      }
    })
  }, [])

  const isAllSelected = useCallback(
    (items: T[]) => {
      if (items.length === 0) return false
      return items.every(item => selectedSet.has(item.id))
    },
    [selectedSet]
  )

  const isPartiallySelected = useCallback(
    (items: T[]) => {
      if (items.length === 0) return false
      const selectedOnPage = items.filter(item => selectedSet.has(item.id)).length
      return selectedOnPage > 0 && selectedOnPage < items.length
    },
    [selectedSet]
  )

  const getSelectedItems = useCallback(
    (items: T[]) => items.filter(item => selectedSet.has(item.id)),
    [selectedSet]
  )

  return {
    selectedIds,
    selectedSet,
    selectedCount,
    isSelected,
    toggle,
    select,
    deselect,
    toggleAll,
    selectAll,
    clearSelection,
    selectMultiple,
    isAllSelected,
    isPartiallySelected,
    getSelectedItems,
  }
}

export default useSelection
