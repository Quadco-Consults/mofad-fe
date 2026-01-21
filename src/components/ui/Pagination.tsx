import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface PaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Total number of items */
  totalCount: number
  /** Number of items per page */
  pageSize: number
  /** Called when page changes */
  onPageChange: (page: number) => void
  /** Start index for display (1-indexed) */
  startIndex?: number
  /** End index for display */
  endIndex?: number
  /** Maximum number of page buttons to show */
  maxVisiblePages?: number
  /** Whether to show first/last page buttons */
  showFirstLast?: boolean
  /** Whether to show the count text */
  showCount?: boolean
  /** Custom class name */
  className?: string
  /** Disabled state */
  disabled?: boolean
}

/**
 * A pagination component for navigating through paginated data.
 *
 * @example
 * ```tsx
 * const pagination = usePagination(data)
 *
 * <Pagination
 *   currentPage={pagination.currentPage}
 *   totalPages={pagination.totalPages}
 *   totalCount={pagination.totalCount}
 *   pageSize={pagination.pageSize}
 *   startIndex={pagination.startIndex}
 *   endIndex={pagination.endIndex}
 *   onPageChange={pagination.goToPage}
 * />
 * ```
 */
export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  startIndex,
  endIndex,
  maxVisiblePages = 7,
  showFirstLast = true,
  showCount = true,
  className,
  disabled = false,
}: PaginationProps) {
  // Calculate display indices if not provided
  const displayStart = startIndex ?? (totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1)
  const displayEnd = endIndex ?? Math.min(currentPage * pageSize, totalCount)

  // Generate page numbers
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | 'ellipsis')[] = []
    const sidePages = Math.floor((maxVisiblePages - 3) / 2)

    pages.push(1)

    let start = Math.max(2, currentPage - sidePages)
    let end = Math.min(totalPages - 1, currentPage + sidePages)

    if (currentPage <= sidePages + 2) {
      end = Math.min(totalPages - 1, maxVisiblePages - 2)
    }

    if (currentPage >= totalPages - sidePages - 1) {
      start = Math.max(2, totalPages - maxVisiblePages + 3)
    }

    if (start > 2) {
      pages.push('ellipsis')
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages - 1) {
      pages.push('ellipsis')
    }

    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  if (totalPages <= 1 && totalCount === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3',
        className
      )}
    >
      {/* Count text */}
      {showCount && (
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{displayStart}</span> to{' '}
          <span className="font-medium">{displayEnd}</span> of{' '}
          <span className="font-medium">{totalCount.toLocaleString()}</span> results
        </p>
      )}

      {/* Pagination controls */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* First page button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={disabled || !hasPrevPage}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Previous page button */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || !hasPrevPage}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page number buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, index) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-400"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-8 w-8 p-0',
                  page === currentPage && 'pointer-events-none'
                )}
                onClick={() => onPageChange(page)}
                disabled={disabled}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </Button>
            )
          )}
        </div>

        {/* Mobile page indicator */}
        <span className="sm:hidden text-sm text-gray-700 px-2">
          Page {currentPage} of {totalPages}
        </span>

        {/* Next page button */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || !hasNextPage}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={disabled || !hasNextPage}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </nav>
    </div>
  )
}

export default Pagination
