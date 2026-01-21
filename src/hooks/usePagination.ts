import { useState, useCallback, useMemo } from 'react'

interface PaginatorResponse {
  count: number
  page: number
  page_size: number
  total_pages: number
  next: string | null
  previous: string | null
}

interface PaginatedResponse<T> {
  paginator?: PaginatorResponse
  count?: number
  next?: string | null
  previous?: string | null
  results?: T[]
}

interface UsePaginationOptions {
  /** Initial page number (1-indexed) */
  initialPage?: number
  /** Number of items per page */
  pageSize?: number
}

interface UsePaginationReturn<T> {
  /** Current page number (1-indexed) */
  currentPage: number
  /** Set the current page */
  setCurrentPage: (page: number) => void
  /** Total number of items */
  totalCount: number
  /** Total number of pages */
  totalPages: number
  /** Number of items per page */
  pageSize: number
  /** Items on the current page */
  results: T[]
  /** Whether there is a next page */
  hasNextPage: boolean
  /** Whether there is a previous page */
  hasPrevPage: boolean
  /** Go to the next page */
  goToNext: () => void
  /** Go to the previous page */
  goToPrev: () => void
  /** Go to a specific page */
  goToPage: (page: number) => void
  /** Go to the first page */
  goToFirst: () => void
  /** Go to the last page */
  goToLast: () => void
  /** Start index for current page (1-indexed, for display) */
  startIndex: number
  /** End index for current page (for display) */
  endIndex: number
  /** Generate page numbers for pagination UI */
  getPageNumbers: (maxVisible?: number) => (number | 'ellipsis')[]
  /** Query params object for API calls */
  queryParams: { page: number; size: number }
}

/**
 * A hook for managing pagination state.
 * Works with the MOFAD backend response format: { paginator: { count, total_pages }, results }
 *
 * @example
 * ```tsx
 * const { data } = useQuery(['products', page], () =>
 *   apiClient.getProducts({ page, size: 20 })
 * )
 *
 * const pagination = usePagination(data, { pageSize: 20 })
 *
 * // In your component
 * <Table data={pagination.results} />
 * <Pagination
 *   currentPage={pagination.currentPage}
 *   totalPages={pagination.totalPages}
 *   onPageChange={pagination.goToPage}
 * />
 * ```
 */
export function usePagination<T = any>(
  data: PaginatedResponse<T> | T[] | null | undefined,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { initialPage = 1, pageSize: defaultPageSize = 20 } = options

  const [currentPage, setCurrentPageState] = useState(initialPage)

  // Extract pagination info from response
  const paginationInfo = useMemo(() => {
    if (!data) {
      return {
        totalCount: 0,
        totalPages: 1,
        pageSize: defaultPageSize,
        results: [] as T[],
      }
    }

    // Handle array response (non-paginated)
    if (Array.isArray(data)) {
      return {
        totalCount: data.length,
        totalPages: 1,
        pageSize: data.length || defaultPageSize,
        results: data,
      }
    }

    // Handle MOFAD backend format: { paginator: {...}, results: [...] }
    if ('paginator' in data && data.paginator) {
      return {
        totalCount: data.paginator.count,
        totalPages: data.paginator.total_pages,
        pageSize: data.paginator.page_size || defaultPageSize,
        results: data.results || [],
      }
    }

    // Handle standard DRF format: { count, next, previous, results }
    if ('count' in data) {
      const count = data.count || 0
      const results = data.results || []
      return {
        totalCount: count,
        totalPages: Math.ceil(count / defaultPageSize) || 1,
        pageSize: defaultPageSize,
        results,
      }
    }

    // Fallback for unknown format
    return {
      totalCount: 0,
      totalPages: 1,
      pageSize: defaultPageSize,
      results: [] as T[],
    }
  }, [data, defaultPageSize])

  const { totalCount, totalPages, pageSize, results } = paginationInfo

  const setCurrentPage = useCallback((page: number) => {
    const validPage = Math.min(Math.max(1, page), Math.max(1, totalPages))
    setCurrentPageState(validPage)
  }, [totalPages])

  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  const goToNext = useCallback(() => {
    if (hasNextPage) {
      setCurrentPageState(prev => prev + 1)
    }
  }, [hasNextPage])

  const goToPrev = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPageState(prev => prev - 1)
    }
  }, [hasPrevPage])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [setCurrentPage])

  const goToFirst = useCallback(() => {
    setCurrentPageState(1)
  }, [])

  const goToLast = useCallback(() => {
    setCurrentPageState(totalPages)
  }, [totalPages])

  // Calculate display indices (1-indexed for user display)
  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalCount)

  // Generate page numbers for pagination UI
  const getPageNumbers = useCallback((maxVisible = 7): (number | 'ellipsis')[] => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | 'ellipsis')[] = []
    const sidePages = Math.floor((maxVisible - 3) / 2) // Pages on each side of current

    // Always show first page
    pages.push(1)

    // Calculate range around current page
    let start = Math.max(2, currentPage - sidePages)
    let end = Math.min(totalPages - 1, currentPage + sidePages)

    // Adjust if at the beginning
    if (currentPage <= sidePages + 2) {
      end = Math.min(totalPages - 1, maxVisible - 2)
    }

    // Adjust if at the end
    if (currentPage >= totalPages - sidePages - 1) {
      start = Math.max(2, totalPages - maxVisible + 3)
    }

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('ellipsis')
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push('ellipsis')
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }, [currentPage, totalPages])

  // Query params for API calls
  const queryParams = useMemo(() => ({
    page: currentPage,
    size: pageSize,
  }), [currentPage, pageSize])

  return {
    currentPage,
    setCurrentPage,
    totalCount,
    totalPages,
    pageSize,
    results,
    hasNextPage,
    hasPrevPage,
    goToNext,
    goToPrev,
    goToPage,
    goToFirst,
    goToLast,
    startIndex,
    endIndex,
    getPageNumbers,
    queryParams,
  }
}

export default usePagination
