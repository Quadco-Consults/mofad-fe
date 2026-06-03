import { Loader2, Package, Truck } from 'lucide-react'
import { formatDate } from './warehouse-utils'

interface InboundTransfersTableProps {
  transfers: any[]
  isLoading: boolean
  onReceiveClick: (transfer: any) => void
}

export function InboundTransfersTable({
  transfers,
  isLoading,
  onReceiveClick,
}: InboundTransfersTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading inbound transfers...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Inbound Stock Transfers
        </h3>
        <p className="text-sm text-gray-600 mt-1">Stock transfers arriving to this warehouse</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Transfer Number</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">From Warehouse</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Products</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Total Items</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Transfer Date</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Expected Arrival</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transfers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No inbound transfers. All transfers have been received.</p>
                </td>
              </tr>
            ) : (
              transfers.map((transfer: any, index: number) => (
                <tr
                  key={transfer.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {transfer.transfer_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {transfer.from_warehouse_name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="max-w-xs">
                      {transfer.items && transfer.items.length > 0 ? (
                        <div className="space-y-1">
                          {transfer.items.slice(0, 2).map((item: any, idx: number) => (
                            <div key={idx} className="text-xs text-gray-600">
                              {item.product_name} ({item.quantity} units)
                            </div>
                          ))}
                          {transfer.items.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{transfer.items.length - 2} more...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No items</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                    {transfer.items?.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0).toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">
                    {formatDate(transfer.transfer_date || transfer.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">
                    {transfer.expected_arrival_date ? formatDate(transfer.expected_arrival_date) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transfer.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      transfer.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {transfer.status === 'in_transit' ? 'In Transit' : transfer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {transfer.status === 'in_transit' && (
                      <button
                        onClick={() => onReceiveClick(transfer)}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                      >
                        Receive
                      </button>
                    )}
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
