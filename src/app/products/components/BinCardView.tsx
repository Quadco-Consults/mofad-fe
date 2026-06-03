import { Calendar, Loader2, Package } from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/lib/utils'

// Bin card interfaces
export interface BinCardTransaction {
  id: number
  transaction_date: string
  transaction_type:
    | 'receipt'
    | 'issue'
    | 'transfer_out'
    | 'transfer_in'
    | 'adjustment'
    | 'return'
    | 'loss'
    | 'cycle_count'
  reference_number: string | null
  description: string
  quantity_in: number
  quantity_out: number
  balance_after: number
  unit_cost: number | null
  value: number | null
  created_by_name: string | null
}

export interface BinCardData {
  warehouse_id: number
  warehouse_name: string
  product_id: number
  product_name: string
  current_quantity: number
  total_receipts: number
  total_issues: number
  transaction_count: number
  transactions: BinCardTransaction[]
}

interface BinCardViewProps {
  binCardData: BinCardData | null
  isLoading: boolean
  error: any
  warehouses: Array<{ id: number; name: string; code: string }>
  selectedWarehouseId: number | null
  onWarehouseChange: (warehouseId: number | null) => void
}

export function BinCardView({
  binCardData,
  isLoading,
  error,
  warehouses,
  selectedWarehouseId,
  onWarehouseChange,
}: BinCardViewProps) {
  return (
    <div className="space-y-4">
      {/* Header with Current Stock */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          <div>
            <div className="text-sm text-gray-500">Current Stock Balance</div>
            <div className="text-2xl font-bold text-primary">
              {binCardData?.current_quantity || 0} units
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse Selection */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Warehouse
        </label>
        <select
          value={selectedWarehouseId || ''}
          onChange={(e) => onWarehouseChange(Number(e.target.value) || null)}
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
        >
          <option value="">Select warehouse...</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name} ({warehouse.code})
            </option>
          ))}
        </select>
      </div>

      {/* Transactions Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                In
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Out
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Cost
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                By
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-gray-500">Loading bin card data...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center">
                  <div className="text-red-600">
                    Error loading bin card: {error.message || 'Unknown error'}
                  </div>
                </td>
              </tr>
            ) : !selectedWarehouseId ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center">
                  <div className="text-gray-500">
                    Please select a warehouse to view bin card
                  </div>
                </td>
              </tr>
            ) : binCardData?.transactions && binCardData.transactions.length > 0 ? (
              binCardData.transactions.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  {/* Date */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatDateTime(entry.transaction_date)}
                      </span>
                    </div>
                  </td>

                  {/* Reference */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-900">
                      {entry.reference_number || '-'}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{entry.description}</div>
                  </td>

                  {/* Transaction Type */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {entry.transaction_type}
                      </span>
                    </div>
                  </td>

                  {/* Quantity In */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {entry.quantity_in > 0 ? (
                      <span className="text-sm font-semibold text-green-600">
                        +{entry.quantity_in}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Quantity Out */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {entry.quantity_out > 0 ? (
                      <span className="text-sm font-semibold text-red-600">
                        -{entry.quantity_out}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Balance After */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-sm font-bold text-primary">
                      {entry.balance_after}
                    </span>
                  </td>

                  {/* Unit Cost */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {entry.unit_cost ? (
                      <span className="text-sm text-gray-900">
                        {formatCurrency(entry.unit_cost)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Value */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {entry.value ? (
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(entry.value)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Created By */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {entry.created_by_name || '-'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center">
                  <div className="text-gray-500">
                    No transactions found for this product in the selected warehouse
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      {selectedWarehouseId && binCardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-800 font-medium">Total Received</div>
            <div className="text-2xl font-bold text-green-600">
              {binCardData.total_receipts?.toLocaleString() || '0'}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-800 font-medium">Total Issued</div>
            <div className="text-2xl font-bold text-red-600">
              {binCardData.total_issues?.toLocaleString() || '0'}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-800 font-medium">Current Balance</div>
            <div className="text-2xl font-bold text-blue-600">
              {binCardData.current_quantity?.toLocaleString() || '0'} units
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
