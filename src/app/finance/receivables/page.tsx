'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { AccountsReceivable } from '@/components/finance/AccountsReceivable'

export default function ReceivablesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Accounts Receivable</h1>
            <p className="text-muted-foreground">Manage customer invoices and payment collection</p>
          </div>
        </div>

        {/* Accounts Receivable Component */}
        <AccountsReceivable />
      </div>
    </AppLayout>
  )
}
