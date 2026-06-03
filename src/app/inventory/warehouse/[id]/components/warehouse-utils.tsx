import { TrendingUp, TrendingDown, Package } from 'lucide-react'

// ===== TYPE DEFINITIONS =====

export interface InventoryItem {
  id: number
  product: {
    id: number
    name: string
    code: string
    category: string | null
    description?: string | null
    cost_price: number | null
    selling_price: number | null
  } | null
  warehouse: {
    id: number
    name: string
    location: string | null
  } | null
  current_stock: number
  reorder_level: number
  unit_cost: number | null
  total_value: number
  last_updated: string
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  supplier_name?: string
}

export interface PendingReceipt {
  id: string
  proId: number
  productId: number
  proNumber: string
  supplierName: string
  productCode: string
  productName: string
  orderedQty: number
  receivedQty: number
  pendingQty: number
  unitPrice: number
  totalValue: number
  orderDate: string
  expectedDate: string
  status: 'pending' | 'partial' | 'overdue'
}

export interface BinCardEntry {
  id: string
  date: string
  refNo: string
  description: string
  type: 'receipt' | 'issue' | 'adjustment'
  received: number
  issued: number
  balance: number
  unit: string
}

// ===== UTILITY FUNCTIONS =====

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'in-stock':
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">In Stock</span>
    case 'low-stock':
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>
    case 'out-of-stock':
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Out of Stock</span>
    default:
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
  }
}

export const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'petroleum':
      return 'bg-blue-100 text-blue-800'
    case 'lubricants':
      return 'bg-green-100 text-green-800'
    case 'additives':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getStockLevelIndicator = (currentStock: number, reorderLevel: number) => {
  const percentage = (currentStock / reorderLevel) * 100
  if (percentage > 150) {
    return <TrendingUp className="w-4 h-4 text-green-600" />
  } else if (percentage > 100) {
    return <TrendingUp className="w-4 h-4 text-yellow-600" />
  } else {
    return <TrendingDown className="w-4 h-4 text-red-600" />
  }
}

export const getReceiptStatusBadge = (status: 'pending' | 'partial' | 'overdue') => {
  switch (status) {
    case 'pending':
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Pending</span>
    case 'partial':
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Partial</span>
    case 'overdue':
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Overdue</span>
    default:
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
  }
}

export const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString()}`
}

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}

// Transform backend inventory data to frontend format
export const transformInventoryItem = (item: any, warehouseData: any, allProducts: any[]): InventoryItem => {
  const fullProduct = allProducts.find((p: any) => p.id === item.product)

  return {
    id: item.id,
    product: {
      id: item.product,
      name: item.product_name || 'Unknown Product',
      code: item.product_code || `ID-${item.id}`,
      description: item.product_description || fullProduct?.description || '',
      category: fullProduct?.category || null,
      cost_price: fullProduct?.cost_price || parseFloat(item.average_cost || 0),
      selling_price: fullProduct?.selling_price || 0,
    },
    warehouse: warehouseData ? {
      id: warehouseData.id,
      name: warehouseData.name,
      location: warehouseData.location,
    } : null,
    current_stock: parseFloat(item.quantity_on_hand || 0),
    reorder_level: parseFloat(item.reorder_point || item.minimum_level || 0),
    unit_cost: parseFloat(item.average_cost || 0),
    total_value: parseFloat(item.total_cost_value || 0),
    last_updated: item.updated_at,
    status: parseFloat(item.quantity_on_hand || 0) === 0 ? 'out-of-stock' as const :
            parseFloat(item.quantity_on_hand || 0) <= parseFloat(item.reorder_point || item.minimum_level || 0) ? 'low-stock' as const :
            'in-stock' as const,
    supplier_name: fullProduct?.primary_supplier,
  }
}

// Transform PRO data to PendingReceipt format
export const transformPendingReceipts = (pros: any[]): PendingReceipt[] => {
  const pendingReceipts: PendingReceipt[] = []

  pros.forEach((pro: any) => {
    const items = pro.items || []
    items.forEach((item: any) => {
      const orderedQty = Number(item.quantity || 0)
      const receivedQty = Number(item.quantity_delivered || 0)
      const pendingQty = Number(item.quantity_remaining || orderedQty - receivedQty)

      if (pendingQty > 0) {
        pendingReceipts.push({
          id: `${pro.id}-${item.id}`,
          proId: pro.id,
          productId: item.product,
          proNumber: pro.pro_number,
          supplierName: pro.supplier || 'Unknown Supplier',
          productCode: item.product_code,
          productName: item.product_name,
          orderedQty,
          receivedQty,
          pendingQty,
          unitPrice: Number(item.unit_price || 0),
          totalValue: pendingQty * Number(item.unit_price || 0),
          orderDate: pro.created_at ? new Date(pro.created_at).toLocaleDateString() : 'N/A',
          expectedDate: pro.expected_delivery_date || 'N/A',
          status: pendingQty === orderedQty ? 'pending' : 'partial'
        })
      }
    })
  })

  return pendingReceipts
}

// Filter inventory items based on search and status
export const filterInventoryItems = (
  items: InventoryItem[],
  searchTerm: string,
  stockFilter: 'all' | 'in-stock' | 'out-of-stock'
): InventoryItem[] => {
  return items.filter((item) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        item.product?.name?.toLowerCase().includes(searchLower) ||
        item.product?.code?.toLowerCase().includes(searchLower) ||
        item.product?.category?.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false
    }

    // Stock filter
    if (stockFilter === 'in-stock' && item.current_stock === 0) return false
    if (stockFilter === 'out-of-stock' && item.current_stock > 0) return false

    return true
  })
}

export const getCategoryIcon = () => {
  return <Package className="w-3 h-3 mr-1" />
}
