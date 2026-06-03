import { Fragment, useState } from 'react'
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from './warehouse-utils'

interface GRNHistoryTableProps {
  grns: any[]
  isLoading: boolean
}

export function GRNHistoryTable({ grns, isLoading }: GRNHistoryTableProps) {
  const [expandedGRNs, setExpandedGRNs] = useState<Set<number>>(new Set())

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading GRN history...</p>
      </div>
    )
  }

  const toggleGRN = (grnId: number) => {
    const newExpanded = new Set(expandedGRNs)
    if (newExpanded.has(grnId)) {
      newExpanded.delete(grnId)
    } else {
      newExpanded.add(grnId)
    }
    setExpandedGRNs(newExpanded)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Goods Receipt Notes (GRN) History</h3>
        <p className="text-sm text-gray-600 mt-1">All batch deliveries received at this warehouse</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">GRN Number</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">PRO Number</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Supplier</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Received Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Quantities</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Total Value</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">QC Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {grns.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No GRN history found for this warehouse.
                </td>
              </tr>
            ) : (
              grns.map((grn: any, index: number) => {
                const isExpanded = expandedGRNs.has(grn.id)
                return (
                  <Fragment key={grn.id}>
                    <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <button
                          onClick={() => toggleGRN(grn.id)}
                          className="flex items-center gap-2 hover:text-orange-600"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          {grn.grn_number}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{grn.pro_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{grn.supplier_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(grn.received_date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">Received: {grn.total_quantity_received?.toLocaleString() || 0}</div>
                          <div className="text-green-600">Accepted: {grn.total_quantity_accepted?.toLocaleString() || 0}</div>
                          <div className="text-red-600">Rejected: {grn.total_quantity_rejected?.toLocaleString() || 0}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                        {formatCurrency(grn.total_value || 0)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          grn.qc_status === 'passed' ? 'bg-green-100 text-green-800' :
                          grn.qc_status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {grn.qc_status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          grn.status === 'completed' ? 'bg-green-100 text-green-800' :
                          grn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {grn.status}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && grn.items && grn.items.length > 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 bg-gray-50">
                          <div className="ml-8">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">GRN Items:</h4>
                            <table className="min-w-full">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty Received</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty Accepted</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty Rejected</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Unit Cost</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {grn.items.map((item: any) => (
                                  <tr key={item.id}>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      <div>
                                        <div className="font-medium">{item.product_name}</div>
                                        <div className="text-xs text-gray-500">{item.product_code}</div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.quantity_received}</td>
                                    <td className="px-4 py-2 text-sm text-green-600 text-right">{item.quantity_accepted}</td>
                                    <td className="px-4 py-2 text-sm text-red-600 text-right">{item.quantity_rejected || 0}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.unit_cost || 0)}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                                      {formatCurrency(item.total_cost || 0)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
