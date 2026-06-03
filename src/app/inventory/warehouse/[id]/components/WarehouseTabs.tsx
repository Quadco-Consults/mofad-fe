export type TabType = 'inventory' | 'receipts' | 'pending_issues' | 'grn_history' | 'inbound_transfers'

interface WarehouseTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  counts: {
    inventory: number
    receipts: number
    issues: number
    grns: number
    transfers: number
  }
  loading: {
    inventory: boolean
    receipts: boolean
    issues: boolean
    grns: boolean
    transfers: boolean
  }
}

export function WarehouseTabs({
  activeTab,
  onTabChange,
  counts,
  loading,
}: WarehouseTabsProps) {
  const tabs = [
    {
      id: 'inventory' as const,
      label: 'Current Inventory',
      count: counts.inventory,
      isLoading: loading.inventory,
    },
    {
      id: 'receipts' as const,
      label: 'Pending Receipts (PRO)',
      count: counts.receipts,
      isLoading: loading.receipts,
    },
    {
      id: 'pending_issues' as const,
      label: 'Pending Issues (PRF)',
      count: counts.issues,
      isLoading: loading.issues,
    },
    {
      id: 'grn_history' as const,
      label: 'GRN History',
      count: counts.grns,
      isLoading: loading.grns,
    },
    {
      id: 'inbound_transfers' as const,
      label: 'Inbound Transfers',
      count: counts.transfers,
      isLoading: loading.transfers,
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.isLoading ? '...' : tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
