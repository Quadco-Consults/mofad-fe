import { Package, Calendar, Loader2 } from 'lucide-react'
import { PendingReceipt, getReceiptStatusBadge, formatCurrency, formatDate } from './warehouse-utils'

interface PendingReceiptsTableProps {
  receipts: PendingReceipt[]
  isLoading: boolean
  onReceiveClick: (receipt: PendingReceipt) => void
}

export function PendingReceiptsTable({
  receipts,
  isLoading,
  onReceiveClick,
}: PendingReceiptsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading pending receipts...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">PRO Number</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Supplier</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Ordered</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Received</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Pending</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Unit Price</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Total Value</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Expected Date</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {receipts.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No pending receipts. All PROs have been fully received.</p>
                </td>
              </tr>
            ) : (
              receipts.map((receipt, index) => (
                <tr
                  key={receipt.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {receipt.proNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {receipt.supplierName}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{receipt.productName}</div>
                      <div className="text-xs text-gray-500">{receipt.productCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {receipt.orderedQty.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-green-600 text-right font-medium">
                    {receipt.receivedQty.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-orange-600 text-right font-bold">
                    {receipt.pendingQty.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(receipt.unitPrice)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(receipt.totalValue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {receipt.expectedDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getReceiptStatusBadge(receipt.status)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onReceiveClick(receipt)}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                    >
                      Receive
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
