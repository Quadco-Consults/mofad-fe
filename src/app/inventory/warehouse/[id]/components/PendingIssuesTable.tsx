import { Loader2, Package } from 'lucide-react'

interface PendingIssuesTableProps {
  issues: any[]
  isLoading: boolean
  onIssueClick: (issue: any) => void
}

export function PendingIssuesTable({
  issues,
  isLoading,
  onIssueClick,
}: PendingIssuesTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading pending issues...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Pending Issues from PRF</h3>
        <p className="text-sm text-gray-600 mt-1">Products ready to be issued from warehouse</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">PRF Number</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Requested By</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Requested Qty</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Available Stock</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Request Date</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {issues.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No pending issues. All PRFs have been processed.</p>
                </td>
              </tr>
            ) : (
              issues.map((issue: any, index: number) => (
                <tr
                  key={issue.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {issue.prf_number}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{issue.product_name}</div>
                      <div className="text-xs text-gray-500">{issue.product_code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {issue.requester_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                    {issue.quantity?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-green-600 text-right font-medium">
                    {issue.available_stock?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">
                    {new Date(issue.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Ready for Issue
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onIssueClick(issue)}
                      className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                    >
                      Issue
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
