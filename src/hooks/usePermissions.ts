import { useAuthStore } from '@/store/authStore'
import { useMemo } from 'react'
import type { AccessibleEntity } from '@/types'

/**
 * Hook to check if user has access to specific entity
 * Returns true if:
 * - User is admin/staff
 * - User has "all access" flag for that entity type
 * - Entity ID is in user's accessible entities list
 */
export function useEntityAccess(entityType: 'warehouse' | 'substore' | 'lubebay', entityId?: number | string) {
  const user = useAuthStore(state => state.user)

  return useMemo(() => {
    if (!user) return false

    // Admins/staff have access to everything
    if (user.is_staff) return true

    const numericId = typeof entityId === 'string' ? parseInt(entityId) : entityId

    switch (entityType) {
      case 'warehouse':
        // Check if user has all warehouse access
        if (user.has_all_warehouse_access) return true
        // Check if specific warehouse is in accessible list
        if (numericId && user.accessible_warehouses) {
          return user.accessible_warehouses.some(w => w.id === numericId)
        }
        return false

      case 'substore':
        if (user.has_all_substore_access) return true
        if (numericId && user.accessible_substores) {
          return user.accessible_substores.some(s => s.id === numericId)
        }
        return false

      case 'lubebay':
        if (user.has_all_lubebay_access) return true
        if (numericId && user.accessible_lubebays) {
          return user.accessible_lubebays.some(l => l.id === numericId)
        }
        return false

      default:
        return false
    }
  }, [user, entityType, entityId])
}

/**
 * Hook to get list of accessible entities for a specific type
 * Returns:
 * - null if user has "all access" (should fetch all from API)
 * - Array of entity IDs if user has limited access
 * - Empty array if user has no access
 */
export function useAccessibleEntities(entityType: 'warehouse' | 'substore' | 'lubebay'): number[] | null {
  const user = useAuthStore(state => state.user)

  return useMemo(() => {
    if (!user) return []

    // Admins/staff have access to everything
    if (user.is_staff) return null

    switch (entityType) {
      case 'warehouse':
        if (user.has_all_warehouse_access) return null
        return user.accessible_warehouses?.map(w => w.id) || []

      case 'substore':
        if (user.has_all_substore_access) return null
        return user.accessible_substores?.map(s => s.id) || []

      case 'lubebay':
        if (user.has_all_lubebay_access) return null
        return user.accessible_lubebays?.map(l => l.id) || []

      default:
        return []
    }
  }, [user, entityType])
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  const user = useAuthStore(state => state.user)
  return user?.is_staff || false
}

/**
 * Hook to filter a list of items based on entity access
 * Returns filtered list if user has limited access
 * Returns original list if user has all access
 */
export function useFilterByEntityAccess<T extends { id: number | string }>(
  items: T[] | undefined,
  entityType: 'warehouse' | 'substore' | 'lubebay'
): T[] {
  const accessibleIds = useAccessibleEntities(entityType)

  return useMemo(() => {
    if (!items) return []
    if (accessibleIds === null) return items // User has all access
    if (accessibleIds.length === 0) return [] // User has no access

    return items.filter(item => {
      const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id
      return accessibleIds.includes(itemId)
    })
  }, [items, accessibleIds])
}

/**
 * Hook to get entity access summary
 */
export function useEntityAccessSummary() {
  const user = useAuthStore(state => state.user)

  return useMemo(() => {
    if (!user) return null
    return user.entity_access || null
  }, [user])
}
