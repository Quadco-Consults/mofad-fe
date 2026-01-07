'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { CashFlowAnalysis } from '@/components/finance/CashFlowAnalysis'

export default function CashFlowPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cash Flow Analysis</h1>
            <p className="text-muted-foreground">Monitor cash inflows, outflows, and liquidity position</p>
          </div>
        </div>

        {/* Cash Flow Analysis Component */}
        <CashFlowAnalysis />
      </div>
    </AppLayout>
  )
}