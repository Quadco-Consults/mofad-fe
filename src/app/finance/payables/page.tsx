'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { AccountsPayable } from '@/components/finance/AccountsPayable'

export default function PayablesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Accounts Payable</h1>
            <p className="text-muted-foreground">Manage vendor invoices and payment processing</p>
          </div>
        </div>

        {/* Accounts Payable Component */}
        <AccountsPayable />
      </div>
    </AppLayout>
  )
}